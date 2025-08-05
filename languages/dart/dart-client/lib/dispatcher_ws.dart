import 'dart:async';
import 'dart:io';

import 'package:arri_core/arri_core.dart';
import 'package:arri_client/dispatcher.dart';
import 'package:arri_client/request.dart';
import 'package:ulid/ulid.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final File logFile = File("log.txt");

class WsDispatcher implements Dispatcher {
  final String _connectionUrl;
  final double _heartbeatTimeoutMultiplier;

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _streamSubscription;

  final Map<String, Function(ServerMessage)> _messageHandlers = {};
  late Timer? _connectionCheckerTimer;

  WsDispatcher({
    required String connectionUrl,
    double? heartbeatTimeoutMultiplier,
  })  : _connectionUrl = connectionUrl,
        _heartbeatTimeoutMultiplier = heartbeatTimeoutMultiplier ?? 2 {
    _connectionCheckerTimer = Timer.periodic(Duration(seconds: 1), (_) {
      if (_channel?.closeCode != null) {
        setupConnection(forceReconnect: true, isReconnect: true);
      }
    });
  }

  Future<void> setupConnection({
    bool? forceReconnect,
    bool isReconnect = false,
  }) async {
    if (_streamSubscription != null && forceReconnect != true) return;
    if (forceReconnect == true) {
      _streamSubscription?.cancel();
      _channel?.sink.close();
    }
    _channel = WebSocketChannel.connect(Uri.parse(_connectionUrl));
    _streamSubscription = _channel?.stream.listen(
      _handleMessage,
      onError: (err) {
        print("CHANNEL:ERROR $err");
      },
      onDone: () {
        if (_channel?.closeCode != null) {
          setupConnection(forceReconnect: true, isReconnect: true);
        }
      },
    );
    await _channel!.ready;
    if (isReconnect) {
      for (final es in _eventStreams.values) {
        es.reconnect();
      }
    }
    logFile.writeAsString("", mode: FileMode.write);
  }

  _handleMessage(dynamic data) {
    if (data is! String) return;
    logFile.writeAsStringSync("$data\n-----\n", mode: FileMode.append);
    final msg = ServerMessage.fromString(data).unwrap();
    if (msg == null || msg.reqId == null) return;
    _messageHandlers[msg.reqId]?.call(msg);
  }

  @override
  FutureOr<TOutput> handleRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required Duration? timeout,
    required int? retry,
    required Duration? retryDelay,
    required OnErrorHook? onError,
    int? retryCount,
  }) async {
    final actualRetryCount = retryCount ?? 0;
    try {
      if (req.reqId == null || req.reqId!.isEmpty) {
        req.reqId = Ulid().toString();
      }
      await setupConnection();
      final completer = Completer<TOutput>();
      final timerDuration = timeout ?? Duration(seconds: 30);
      final timer = Timer(timerDuration, () {
        if (completer.isCompleted) return;
        if (_messageHandlers.containsKey(req.reqId)) {
          _messageHandlers.remove(req.reqId);
        }
        completer.completeError(
          TimeoutException("Timeout exceeded", timerDuration),
        );
      });
      _messageHandlers[req.reqId!] = (msg) {
        switch (msg) {
          case ServerSuccessMessage():
            final result = responseDecoder(msg.body ?? "");
            timer.cancel();
            completer.complete(result);
            return;
          case ServerFailureMessage():
            timer.cancel();
            completer.completeError(
              msg.error ??
                  ArriError(
                    code: 0,
                    message: 'Received error response from server',
                  ),
            );
            return;
          case HeartbeatMessage():
          case ServerConnectionStartMessage():
          case StreamStartMessage():
          case StreamDataMessage():
          case ServerEventStreamEndMessage():
            return;
        }
      };
      final payload = ClientMessage(
        rpcName: req.procedure,
        reqId: req.reqId,
        method: null,
        path: req.path,
        contentType: ContentType.json,
        clientVersion: req.clientVersion,
        customHeaders: await req.customHeaders?.call() ?? {},
        body: req.data,
      );
      _channel?.sink.add(payload.encodeString());
      final result = await completer.future;
      _messageHandlers.remove(req.reqId);
      return result;
    } catch (err) {
      if (err is TimeoutException) {
        onError?.call(req, err);
        rethrow;
      }
      if (retry != null && actualRetryCount < retry) {
        if (timeout != null) await Future.delayed(timeout);
        return handleRpc(
          req: req,
          responseDecoder: responseDecoder,
          timeout: timeout,
          retry: retry,
          retryDelay: retryDelay,
          onError: onError,
          retryCount: actualRetryCount + 1,
        );
      }
      onError?.call(req, err);
      rethrow;
    }
  }

  Future<WebSocketChannel?> _getWebsocketChannel() async {
    if (_channel != null) return _channel!;
    await setupConnection();
    return _channel!;
  }

  @override
  ArriEventSource<TOutput>
      handleOutputStreamRpc<TInput extends ArriModel?, TOutput>({
    required RpcRequest<TInput> req,
    required TOutput Function(String input) responseDecoder,
    required String? lastEventId,
    required ArriEventSourceHookOnData<TOutput>? onData,
    required ArriEventSourceHookOnRawData<TOutput>? onRawData,
    required ArriEventSourceHookOnOpen<TOutput>? onOpen,
    required ArriEventSourceHookOnClose<TOutput>? onClose,
    required ArriEventSourceHookOnError<TOutput>? onError,
    required Duration? timeout,
    required int? maxRetryCount,
    required Duration? maxRetryInterval,
    required double? heartbeatTimeoutMultiplier,
  }) {
    if (req.reqId == null) req.reqId = Ulid().toString();
    final eventStream = WsArriEventSource(
      decoder: responseDecoder,
      onData: onData,
      onRawData: onRawData,
      onOpen: onOpen,
      onClose: (es) {
        if (_messageHandlers.containsKey(req.reqId)) {
          _messageHandlers.remove(req.reqId);
        }
        if (_eventStreams.containsKey(req.reqId)) {
          _eventStreams.remove(req.reqId);
        }
        onClose?.call(es);
      },
      onError: onError,
      getWebsocketChannel: () async {
        final channel = await _getWebsocketChannel();
        if (channel == null) throw Exception("Error creating connection");
        return channel;
      },
      req: req,
    );
    _messageHandlers[req.reqId!] = (msg) => eventStream.handleMessage(msg);
    _eventStreams[req.reqId!] = eventStream;
    Timer.run(() => eventStream.start());
    return eventStream;
  }

  final Map<String, ArriEventSource<dynamic>> _eventStreams = {};

  @override
  String get transport => "ws";
}

class WsArriEventSource<T> implements ArriEventSource<T> {
  @override
  final T Function(String) decoder;
  final ArriEventSourceHookOnData<T>? onData;
  final ArriEventSourceHookOnRawData<T>? onRawData;
  final ArriEventSourceHookOnOpen<T>? onOpen;
  final ArriEventSourceHookOnClose<T>? onClose;
  final ArriEventSourceHookOnError<T>? onError;

  final RpcRequest req;
  String? lastEventId;
  Future<WebSocketChannel?> Function() getWebsocketChannel;
  WsArriEventSource({
    required this.decoder,
    required this.onData,
    required this.onRawData,
    required this.onOpen,
    required this.onClose,
    required this.onError,
    required this.getWebsocketChannel,
    required this.req,
  }) : assert(req.reqId != null);

  void handleMessage(ServerMessage msg) {
    switch (msg) {
      case ServerSuccessMessage():
        break;
      case ServerFailureMessage():
        onError?.call(msg.error ?? ArriError.unknown(), this);
        reconnect();
        break;
      case HeartbeatMessage():
      case ServerConnectionStartMessage():
        break;
      case StreamStartMessage():
        break;
      case StreamDataMessage():
        final data = decoder(msg.body ?? "");
        onData?.call(data, this);
        _streamController?.sink.add(data);
        break;
      case ServerEventStreamEndMessage():
        _streamController?.close();
        close();
        break;
    }
  }

  start() {
    getWebsocketChannel().then((c) async {
      final msg = ClientMessage(
        rpcName: req.procedure,
        reqId: req.reqId,
        method: null,
        path: req.path,
        contentType: ContentType.json,
        clientVersion: req.clientVersion,
        customHeaders: await req.customHeaders?.call() ?? {},
        body: req.data,
      );
      c?.sink.add(msg.encodeString());
      onOpen?.call(this);
    }).catchError((err) {
      onOpen?.call(this);
      onError?.call(err, this);
    });
  }

  bool _isClosed = false;

  @override
  void close() {
    if (_isClosed) return;
    onClose?.call(this);
    _streamController?.close();
    _streamController = null;
    _isClosed = true;
  }

  @override
  bool get isClosed => _isClosed;

  @override
  void reconnect() {
    start();
  }

  StreamController<T>? _streamController;

  @override
  Stream<T> toStream() {
    _streamController ??= StreamController<T>(onCancel: () {
      close();
      _streamController = null;
    });
    return _streamController!.stream;
  }
}

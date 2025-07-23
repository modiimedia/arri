library;

export 'package:arri_core/arri_core.dart';

export "dispatcher.dart";
export "dispatcher_http.dart";
export 'dispatcher_ws.dart';
export 'parsing.dart';
export 'request.dart';

var _reqCount = 0;

String getRequestId() {
  _reqCount++;
  return _reqCount.toString();
}

String resolveTransport(List<String> availableTransports, String selected) {
  assert(
    availableTransports.isNotEmpty,
    "No transports available for this procedure",
  );
  if (availableTransports.contains(selected)) {
    return selected;
  }
  return availableTransports.first;
}

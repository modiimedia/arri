library;

import 'dart:convert';
import 'package:http/http.dart' as http;

class ArriClient {
  String baseUrl;
  Map<String, String>? defaultHeaders;

  ArriClient({this.baseUrl = "", this.defaultHeaders});

  Future<String> request(
    ArriRoute route, {
    Map<String, String>? headers,
    Map<String, String>? query,
    Map<String, String>? params,
    dynamic body,
    Encoding? encoding,
  }) async {
    String url = "$baseUrl${route.path}";
    if (params != null) {
      for (final entry in params.entries) {
        url = url.replaceAll(":${entry.key}", entry.value);
      }
    }
    if (query != null) {
      final queryParts = <String>[];
      for (final entry in query.entries) {
        queryParts.add("${entry.key}=${entry.value}");
      }
    }
    final mergedHeaders = defaultHeaders ?? {};
    if (headers != null) {
      for (final entry in headers.entries) {
        mergedHeaders[entry.key] = entry.value;
      }
    }
    http.Response? response;
    switch (route.method) {
      case RouteMethod.get:
        response = await http.get(Uri.parse(url), headers: mergedHeaders);
        break;
      case RouteMethod.delete:
        response = await http.delete(Uri.parse(url),
            headers: mergedHeaders, body: body, encoding: encoding);
        break;
      case RouteMethod.post:
        response = await http.post(Uri.parse(url),
            headers: mergedHeaders, body: body, encoding: encoding);
        break;
      case RouteMethod.put:
        response = await http.put(Uri.parse(url),
            headers: mergedHeaders, body: body, encoding: encoding);
      case RouteMethod.patch:
        response = await http.patch(Uri.parse(url),
            headers: mergedHeaders, body: body, encoding: encoding);
        break;
      default:
        throw Exception("No implementation for method: ${route.method.name}");
    }
    if (response.statusCode != 200) {
      throw RouteException.fromResponse(response);
    }
    return response.body;
  }

  Future<T> parsedRequest<T>(
    ArriRoute route, {
    required T Function(String body) parser,
    Map<String, String>? headers,
    Map<String, String>? query,
    Map<String, String>? params,
    dynamic body,
    Encoding? encoding,
  }) async {
    final response = await request(route,
        headers: headers, query: query, body: body, encoding: encoding);
    return parser(response);
  }
}

enum RouteMethod { get, post, put, patch, delete }

class ArriRoute {
  final String path;
  final RouteMethod method;
  const ArriRoute(this.method, this.path);
}

class RouteException implements Exception {
  final int statusCode;
  final String statusMessage;
  final dynamic data;
  const RouteException(
      {required this.statusCode, required this.statusMessage, this.data});

  factory RouteException.fromResponse(http.Response response) {
    try {
      final body = json.decode(response.body);
      return RouteException(
          statusCode: response.statusCode,
          statusMessage: body["statusMessage"] is String
              ? body["statusMessage"]
              : "Unknown error",
          data: body["data"]);
    } catch (err) {
      return RouteException(
          statusCode: response.statusCode, statusMessage: "Unknown error");
    }
  }
}

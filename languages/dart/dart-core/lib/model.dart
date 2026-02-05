import 'dart:typed_data';

import 'package:arri_core/helpers.dart';
import 'package:arri_core/message.dart';

abstract class ArriModel {
  Map<String, dynamic> toJson();
  String toJsonString();
  String toUrlQueryParams();
  List<Object?> get props;
}

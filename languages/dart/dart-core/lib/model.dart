import 'package:arri_core/helpers.dart';

abstract class ArriModel {
  Map<String, dynamic> toJson();
  String toJsonString();
  String toUrlQueryParams();
  List<Object?> get props;
}

abstract class ArriModelValidator<T extends ArriModel> {
  T empty();
  Result<T, Object> parse(Map<String, dynamic> input);
  Result<T, Object> coerce(Map<String, dynamic> input);
}

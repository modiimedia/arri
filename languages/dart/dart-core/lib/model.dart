abstract class ArriModel {
  Map<String, dynamic> toJson();
  String toJsonString();
  String toUrlQueryParams();
  List<Object?> get props;

  static ArriModel fromJson(Map<String, dynamic> input) {
    throw UnimplementedError();
  }

  static ArriModel fromJsonString(String input) {
    throw UnimplementedError();
  }
}

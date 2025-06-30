abstract class ArriModel {
  Map<String, dynamic> toJson();
  String toJsonString();
  String toUrlQueryParams();
  List<Object?> get props;
}

import 'package:arri_codegen_dart_reference/reference_client_v2.dart';

main() {
  final now = DateTime.now();
  final input1 = Book(id: "1", name: "", createdAt: now, updatedAt: now);
  final input2 = Book(id: "1", name: "", createdAt: now, updatedAt: now);
  print(input2);
  print(input1 == input2);
  final input3 = ObjectWithEveryType.empty();
  print(input3.hashCode);
}

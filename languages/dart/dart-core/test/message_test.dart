import 'package:test/test.dart';

import '../lib/arri_core.dart';

void main() {
  test("parseHeaderLine()", () {
    final testCases = <(String input, String expectedKey, String expectedVal)>[
      (
        "foo: foo",
        "foo",
        "foo",
      ),
      (
        "url:  https://www.google.com",
        "url",
        "https://www.google.com",
      ),
      (
        "message:My name is: \"Jeff\".\\nI like ice cream!",
        "message",
        "My name is: \"Jeff\".\\nI like ice cream!"
      )
    ];
    for (final (input, expectedKey, expectedVal) in testCases) {
      final (key, val) = parseHeaderLine(input);
      expect(key, equals(expectedKey));
      expect(val, equals(expectedVal));
    }
  });
}

import 'dart:convert';

import 'package:arri_client/arri_client.dart';

class Book implements ArriModel {
  final String id;
  final String name;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Book({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Book.empty() {
    return Book(
      id: "",
      name: "",
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  factory Book.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    final name = typeFromDynamic<String>(_input_["name"], "");
    final createdAt = dateTimeFromDynamic(_input_["createdAt"], DateTime.now());
    final updatedAt = dateTimeFromDynamic(_input_["updatedAt"], DateTime.now());
    return Book(
      id: id,
      name: name,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory Book.fromJsonString(String input) {
    return Book.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "id": id,
      "name": name,
      "createdAt": createdAt.toIso8601String(),
      "updatedAt": updatedAt.toIso8601String(),
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("id=$id");
    _queryParts_.add("name=$name");
    _queryParts_.add("createdAt=${createdAt.toIso8601String()}");
    _queryParts_.add("updatedAt=${updatedAt.toIso8601String()}");
    return _queryParts_.join("&");
  }

  @override
  Book copyWith({
    String? id,
    String? name,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Book(
      id: id ?? this.id,
      name: name ?? this.name,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is Book &&
        id == other.id &&
        name == other.name &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }
}

class BookParams implements ArriModel {
  final String bookId;
  const BookParams({
    required this.bookId,
  });

  factory BookParams.empty() {
    return BookParams(bookId: "");
  }

  factory BookParams.fromJson(Map<String, dynamic> _input_) {
    final bookId = typeFromDynamic<String>(_input_["bookId"], "");
    return BookParams(
      bookId: bookId,
    );
  }

  factory BookParams.fromJsonString(String input) {
    return BookParams.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "bookId": bookId,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("bookId=$bookId");
    return _queryParts_.join("&");
  }

  @override
  BookParams copyWith({
    String? bookId,
  }) {
    return BookParams(
      bookId: bookId ?? this.bookId,
    );
  }

  @override
  bool operator ==(Object _other_) {
    return _other_ is BookParams && bookId == _other_.bookId;
  }
}

class NestedObject implements ArriModel {
  final String id;
  final String content;
  const NestedObject({
    required this.id,
    required this.content,
  });

  factory NestedObject.empty() {
    return NestedObject(
      id: "",
      content: "",
    );
  }

  factory NestedObject.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    final content = typeFromDynamic<String>(_input_["content"], "");
    return NestedObject(
      id: id,
      content: content,
    );
  }

  factory NestedObject.fromJsonString(String input) {
    return NestedObject.fromJson(json.decode(input));
  }

  @override
  NestedObject copyWith({
    String? id,
    String? content,
  }) {
    return NestedObject(
      id: id ?? this.id,
      content: content ?? this.content,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "id": id,
      "content": content,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("id=$id");
    _queryParts_.add("content=$content");
    return _queryParts_.join("&");
  }

  @override
  bool operator ==(Object other) {
    return other is NestedObject && id == other.id && content == other.content;
  }
}

class ObjectWithEveryType implements ArriModel {
  final String string;
  final bool boolean;
  final DateTime timestamp;
  final double float32;
  final double float64;
  final int int8;
  final int uint8;
  final int int16;
  final int uint16;
  final int int32;
  final int uint32;
  final BigInt int64;
  final BigInt uint64;
  final Enumerator k_enum;
  final NestedObject object;
  final List<bool> array;
  final Map<String, bool> record;
  final Discriminator discriminator;
  final dynamic any;
  const ObjectWithEveryType({
    required this.string,
    required this.boolean,
    required this.timestamp,
    required this.float32,
    required this.float64,
    required this.int8,
    required this.uint8,
    required this.int16,
    required this.uint16,
    required this.int32,
    required this.uint32,
    required this.int64,
    required this.uint64,
    required this.k_enum,
    required this.object,
    required this.array,
    required this.record,
    required this.discriminator,
    required this.any,
  });
  factory ObjectWithEveryType.empty() {
    return ObjectWithEveryType(
      string: "",
      boolean: false,
      timestamp: DateTime.now(),
      float32: 0.0,
      float64: 0.0,
      int8: 0,
      uint8: 0,
      int16: 0,
      uint16: 0,
      int32: 0,
      uint32: 0,
      int64: BigInt.from(0),
      uint64: BigInt.from(0),
      k_enum: Enumerator.Bar,
      object: NestedObject.empty(),
      array: [],
      record: {},
      discriminator: DiscriminatorA.empty(),
      any: null,
    );
  }
  factory ObjectWithEveryType.fromJson(Map<String, dynamic> _input_) {
    final string = typeFromDynamic<String>(_input_["string"], "");
    final boolean = typeFromDynamic<bool>(_input_["boolean"], false);
    final timestamp = dateTimeFromDynamic(_input_["timestamp"], DateTime.now());
    final float32 = typeFromDynamic<double>(_input_["float32"], 0.0);
    final float64 = typeFromDynamic<double>(_input_["float64"], 0.0);
    final int8 = typeFromDynamic<int>(_input_["int8"], 0);
    final uint8 = typeFromDynamic<int>(_input_["uint8"], 0);
    final int16 = typeFromDynamic<int>(_input_["int16"], 0);
    final uint16 = typeFromDynamic<int>(_input_["uint16"], 0);
    final int32 = typeFromDynamic<int>(_input_["int32"], 0);
    final uint32 = typeFromDynamic<int>(_input_["uint32"], 0);
    final int64 = typeFromDynamic<BigInt>(_input_["int64"], BigInt.zero);
    final uint64 = typeFromDynamic<BigInt>(_input_["uint64"], BigInt.zero);
    final k_enum =
        Enumerator.fromString(typeFromDynamic<String>(_input_["enum"], ""));
    final object = _input_["object"] is Map<String, dynamic>
        ? NestedObject.fromJson(_input_["object"])
        : NestedObject.empty();
    final array = _input_["array"] is List
        ? (_input_["array"] as List)
            .map((_el_) => typeFromDynamic<bool>(_el_, false))
            .toList()
        : <bool>[];
    final record = _input_["record"] is Map<String, dynamic>
        ? (_input_["record"] as Map<String, dynamic>).map(
            (_key_, _val_) => MapEntry(
              _key_,
              typeFromDynamic<bool>(_val_, false),
            ),
          )
        : <String, bool>{};
    final discriminator = _input_["discriminator"] is Map<String, dynamic>
        ? Discriminator.fromJson(_input_["discriminator"])
        : Discriminator.empty();
    final any = _input_["any"];
    return ObjectWithEveryType(
      string: string,
      boolean: boolean,
      timestamp: timestamp,
      float32: float32,
      float64: float64,
      int8: int8,
      uint8: uint8,
      int16: int16,
      uint16: uint16,
      int32: int32,
      uint32: uint32,
      int64: int64,
      uint64: uint64,
      k_enum: k_enum,
      object: object,
      array: array,
      record: record,
      discriminator: discriminator,
      any: any,
    );
  }

  @override
  ObjectWithEveryType copyWith({
    String? string,
    bool? boolean,
    DateTime? timestamp,
    double? float32,
    double? float64,
    int? int8,
    int? uint8,
    int? int16,
    int? uint16,
    int? int32,
    int? uint32,
    BigInt? int64,
    BigInt? uint64,
    Enumerator? k_enum,
    NestedObject? object,
    List<bool>? array,
    Map<String, bool>? record,
    Discriminator? discriminator,
    dynamic any,
  }) {
    return ObjectWithEveryType(
      string: string ?? this.string,
      boolean: boolean ?? this.boolean,
      timestamp: timestamp ?? this.timestamp,
      float32: float32 ?? this.float32,
      float64: float64 ?? this.float64,
      int8: int8 ?? this.int8,
      uint8: uint8 ?? this.uint8,
      int16: int16 ?? this.int16,
      uint16: uint16 ?? this.uint16,
      int32: int32 ?? this.int32,
      uint32: uint32 ?? this.uint32,
      int64: int64 ?? this.int64,
      uint64: uint64 ?? this.uint64,
      k_enum: k_enum ?? this.k_enum,
      object: object ?? this.object,
      array: array ?? this.array,
      record: record ?? this.record,
      discriminator: discriminator ?? this.discriminator,
      any: any ?? this.any,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "string": string,
      "boolean": boolean,
      "timestamp": timestamp.toIso8601String(),
      "float32": float32,
      "float64": float64,
      "int8": int8,
      "uint8": uint8,
      "int16": int16,
      "uint16": uint16,
      "int32": int32,
      "uint32": uint32,
      "int64": int64.toString(),
      "uint64": uint64.toString(),
      "enum": k_enum.serialValue,
      "object": object.toJson(),
      "array": array.map((el) => el),
      "record": record.map((key, val) => MapEntry(key, val)),
      "discriminator": discriminator.toJson(),
      "any": any,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("string=$string");
    _queryParts_.add("boolean=$boolean");
    _queryParts_.add("timestamp=${timestamp.toIso8601String()}");
    _queryParts_.add("float32=$float32");
    _queryParts_.add("float64=$float64");
    _queryParts_.add("int8=$int8");
    _queryParts_.add("uint8=$uint8");
    _queryParts_.add("int16=$int16");
    _queryParts_.add("uint16=$uint16");
    _queryParts_.add("int32=$int32");
    _queryParts_.add("uint32=$uint32");
    _queryParts_.add("int64=$int64");
    _queryParts_.add("uint64=$uint64");
    _queryParts_.add("enum=${k_enum.serialValue}");
    // objects cannot serialized to query params
    // arrays cannot be serialized to query params
    // objects cannot be serialized to query params
    // nested objects cannot be serialize to query params
    // any's cannot be serialize to query params
    return _queryParts_.join("&");
  }

  @override
  bool operator ==(Object _other_) {
    return _other_ is ObjectWithEveryType &&
        string == _other_.string &&
        boolean == _other_.boolean &&
        timestamp == _other_.timestamp &&
        float32 == _other_.float32 &&
        float64 == _other_.float64 &&
        int8 == _other_.int8 &&
        uint8 == _other_.uint8 &&
        int16 == _other_.int16 &&
        uint16 == _other_.uint16 &&
        int32 == _other_.int32 &&
        uint32 == _other_.uint32 &&
        int64 == _other_.int64 &&
        uint64 == _other_.uint64 &&
        k_enum == _other_.k_enum &&
        object == _other_.object &&
        array == _other_.array &&
        record == _other_.record &&
        discriminator == _other_.discriminator &&
        any == _other_.any;
  }
}

enum Enumerator implements Comparable<Enumerator> {
  Foo("FOO"),
  Bar("BAR"),
  Baz("BAZ");

  const Enumerator(this.serialValue);
  final String serialValue;

  factory Enumerator.fromString(String input) {
    for (final val in values) {
      if (val.serialValue == input) {
        return val;
      }
    }
    return Foo;
  }

  @override
  int compareTo(Enumerator other) => name.compareTo(other.name);
}

sealed class Discriminator implements ArriModel {
  String get typeName;
  const Discriminator();

  factory Discriminator.empty() {
    return DiscriminatorA.empty();
  }

  factory Discriminator.fromJson(Map<String, dynamic> _input_) {
    final typeName = typeFromDynamic<String>(_input_["typeName"], "");
    switch (typeName) {
      case "A":
        return Discriminator.fromJson(_input_);
      case "B":
      case "C":
      default:
        return Discriminator.empty();
    }
  }

  factory Discriminator.fromJsonString(String input) {
    return Discriminator.fromJson(json.decode(input));
  }
}

class DiscriminatorA implements Discriminator {
  final String id;
  const DiscriminatorA({
    required this.id,
  });

  factory DiscriminatorA.empty() {
    return DiscriminatorA(
      id: "",
    );
  }

  factory DiscriminatorA.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    return DiscriminatorA(
      id: id,
    );
  }

  @override
  String get typeName {
    return "A";
  }

  @override
  DiscriminatorA copyWith({
    String? id,
  }) {
    return DiscriminatorA(
      id: id ?? this.id,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "typeName": typeName,
      "id": id,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("typeName=$typeName");
    _queryParts_.add("id=$id");
    return _queryParts_.join("&");
  }
}

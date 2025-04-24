import { normalizeWhitespace } from '@arrirpc/codegen-utils';

import { dartTypeFromSchema } from './_index';
import { dartEnumFromSchema } from './enum';

test('Outputs proper enum', () => {
    const result = dartEnumFromSchema(
        {
            enum: ['FOO', 'BAR', 'BAZ'],
            metadata: {
                id: 'Option',
            },
        },
        {
            clientName: '',
            clientVersion: '2',
            generatedTypes: [],
            modelPrefix: '',
            schemaPath: '',
            instancePath: '',
        },
    );
    expect(normalizeWhitespace(result.content)).toEqual(
        normalizeWhitespace(`enum Option implements Comparable<Option> {
    foo("FOO"),
    bar("BAR"),
    baz("BAZ");

    const Option(this.serialValue);
    final String serialValue;

    factory Option.fromString(String input) {
        for (final val in values) {
            if (val.serialValue == input) {
                return val;
            }
        }
        return foo;
    }
    
    @override
    int compareTo(Option other) => name.compareTo(other.name);
}`),
    );
});

test('Outputs proper enum with prefixed name', () => {
    const result = dartTypeFromSchema(
        {
            properties: {
                id: {
                    type: 'string',
                },
                role: {
                    enum: ['STANDARD', 'ADMIN'],
                },
            },
            metadata: {
                id: 'User',
            },
        },
        {
            clientName: '',
            clientVersion: '2',
            generatedTypes: [],
            modelPrefix: 'MyClient',
            schemaPath: '',
            instancePath: '',
        },
    );
    expect(normalizeWhitespace(result.content)).toEqual(
        normalizeWhitespace(`
class MyClientUser implements ArriModel {
    final String id;
    final MyClientUserRole role;
    const MyClientUser({
        required this.id,
        required this.role,
    });
    factory MyClientUser.empty() {
        return MyClientUser(
            id: "",
            role: MyClientUserRole.standard,
        );
    }
    factory MyClientUser.fromJson(Map<String, dynamic> _input_) {
        final id = typeFromDynamic<String>(_input_["id"], "");
        final role = MyClientUserRole.fromString(typeFromDynamic<String>(_input_["role"], ""));
        return MyClientUser(
            id: id,
            role: role,
        );
    }
    factory MyClientUser.fromJsonString(String input) {
        return MyClientUser.fromJson(json.decode(input));
    }
    @override
    Map<String, dynamic> toJson() {
        final _output_ = <String, dynamic>{
            "id": id,
            "role": role.serialValue,
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
        _queryParts_.add("role=\${role.serialValue}");
        return _queryParts_.join("&");
    }
    @override
    MyClientUser copyWith({
        String? id,
        MyClientUserRole? role,
    }) {
        return MyClientUser(
            id: id ?? this.id,
            role: role ?? this.role,
        );
    }
    @override
    List<Object?> get props => [
        id,
        role,
    ];
    @override
    bool operator ==(Object other) {
        return other is MyClientUser &&
            listsAreEqual(props, other.props);
    }
    @override
    int get hashCode => listToHashCode(props);
    @override
    String toString() {
        return "MyClientUser \${toJsonString()}";
    }
}

enum MyClientUserRole implements Comparable<MyClientUserRole> {
    standard("STANDARD"),
    admin("ADMIN");

    const MyClientUserRole(this.serialValue);
    final String serialValue;

    factory MyClientUserRole.fromString(String input) {
        for (final val in values) {
            if (val.serialValue == input) {
                return val;
            }
        }
        return standard;
    }
    
    @override
    int compareTo(MyClientUserRole other) => name.compareTo(other.name);
}`),
    );
});

test('Does not output invalid enum sub type names', () => {
    const result = dartTypeFromSchema(
        {
            enum: ['DEFAULT', 'SEALED', 'RETURN'],
            metadata: {
                id: 'MyEnum',
            },
        },
        {
            clientName: '',
            modelPrefix: '',
            generatedTypes: [],
            instancePath: '',
            schemaPath: '',
            clientVersion: '',
        },
    );
    expect(normalizeWhitespace(result.content)).toBe(
        normalizeWhitespace(`enum MyEnum implements Comparable<MyEnum> {
            k_default("DEFAULT"),
            sealed("SEALED"),
            k_return("RETURN");

            const MyEnum(this.serialValue);
            final String serialValue;

            factory MyEnum.fromString(String input) {
                for (final val in values) {
                    if (val.serialValue == input) {
                        return val;
                    }
                }
                return k_default;
            }
            
            @override
            int compareTo(MyEnum other) => name.compareTo(other.name);
        }`),
    );
});

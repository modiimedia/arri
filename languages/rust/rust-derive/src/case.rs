use heck::{
    ToKebabCase, ToLowerCamelCase, ToShoutyKebabCase, ToShoutySnakeCase, ToSnakeCase,
    ToUpperCamelCase,
};

/// A naming convention used by `#[arri(rename_all = "...")]`
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RenameRule {
    Snake,
    Camel,
    Pascal,
    ScreamingSnake,
    Kebab,
    ScreamingKebab,
    Lower,
    Upper,
}

impl RenameRule {
    pub const VALID: &'static str = "\"snake_case\", \"camelCase\", \"PascalCase\", \"SCREAMING_SNAKE_CASE\", \"kebab-case\", \"SCREAMING-KEBAB-CASE\", \"lowercase\", \"UPPERCASE\"";

    pub fn parse(value: &str) -> Option<Self> {
        Some(match value {
            "snake_case" => Self::Snake,
            "camelCase" => Self::Camel,
            "PascalCase" => Self::Pascal,
            "SCREAMING_SNAKE_CASE" => Self::ScreamingSnake,
            "kebab-case" => Self::Kebab,
            "SCREAMING-KEBAB-CASE" => Self::ScreamingKebab,
            "lowercase" => Self::Lower,
            "UPPERCASE" => Self::Upper,
            _ => return None,
        })
    }

    pub fn apply(&self, name: &str) -> String {
        match self {
            Self::Snake => name.to_snake_case(),
            Self::Camel => name.to_lower_camel_case(),
            Self::Pascal => name.to_upper_camel_case(),
            Self::ScreamingSnake => name.to_shouty_snake_case(),
            Self::Kebab => name.to_kebab_case(),
            Self::ScreamingKebab => name.to_shouty_kebab_case(),
            Self::Lower => name.to_lowercase(),
            Self::Upper => name.to_uppercase(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::RenameRule;

    #[test]
    fn rename_rules() {
        let cases = [
            ("snake_case", "created_at", "created_at"),
            ("camelCase", "created_at", "createdAt"),
            ("PascalCase", "created_at", "CreatedAt"),
            (
                "SCREAMING_SNAKE_CASE",
                "NullableTimestamp",
                "NULLABLE_TIMESTAMP",
            ),
            ("kebab-case", "NullableTimestamp", "nullable-timestamp"),
            ("SCREAMING-KEBAB-CASE", "created_at", "CREATED-AT"),
            ("lowercase", "NullableTimestamp", "nullabletimestamp"),
            ("UPPERCASE", "Foo", "FOO"),
        ];
        for (rule, input, expected) in cases {
            assert_eq!(RenameRule::parse(rule).unwrap().apply(input), expected);
        }
        assert!(RenameRule::parse("Snake").is_none());
    }
}

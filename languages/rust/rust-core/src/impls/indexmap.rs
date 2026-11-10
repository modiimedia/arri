use std::{borrow::Cow, hash::BuildHasher};

use indexmap::IndexMap;

use crate::{
    ArriSchema, Decode, DecodeError, Decoder, Encode, EncodeError, Encoder, SchemaContext, TypeDef,
};

impl<V: ArriSchema, S> ArriSchema for IndexMap<String, V, S> {
    fn generic_name() -> Cow<'static, str> {
        Cow::Owned(format!("{}Record", V::generic_name()))
    }

    fn type_def(ctx: &mut SchemaContext) -> TypeDef {
        TypeDef::values(V::type_def(ctx))
    }
}

impl<V: Encode, S> Encode for IndexMap<String, V, S> {
    fn encode<E: Encoder + ?Sized>(&self, e: &mut E) -> Result<(), EncodeError> {
        crate::encode::encode_map(e, self.len(), self)
    }
}

impl<V: Decode, S: BuildHasher + Default> Decode for IndexMap<String, V, S> {
    fn decode<D: Decoder + ?Sized>(d: &mut D) -> Result<Self, DecodeError> {
        let len = d.begin_object()?.unwrap_or(0);
        let mut output = IndexMap::with_capacity_and_hasher(len.min(4096), S::default());
        crate::decode::decode_map(d, |k, v| {
            output.insert(k, v);
        })?;
        Ok(output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::json;

    #[test]
    fn preserves_key_order() {
        let input = r#"{"b":1,"a":2,"c":3}"#;
        let map: IndexMap<String, i32> = json::from_str(input).unwrap();
        assert_eq!(json::to_string(&map).unwrap(), input);
    }
}

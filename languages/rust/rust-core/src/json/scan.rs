//! Fast scanning for bytes that need special handling inside of JSON strings.

const ONES: u64 = 0x0101_0101_0101_0101;
const HIGHS: u64 = 0x8080_8080_8080_8080;

/// `"`, `\`, or a control character
#[inline]
fn is_special(byte: u8) -> bool {
    byte == b'"' || byte == b'\\' || byte < 0x20
}

/// Sets the high bit of every byte in `chunk` that is `"`, `\`, or a control character.
///
/// This uses the "has zero byte" trick (SWAR). Bytes above a match may also be flagged (borrows can
/// propagate upward) but the lowest flagged byte is always a real match, which is all that's needed.
#[inline]
fn special_mask(chunk: u64) -> u64 {
    let quote = chunk ^ (ONES * b'"' as u64);
    let backslash = chunk ^ (ONES * b'\\' as u64);
    let has_quote = quote.wrapping_sub(ONES) & !quote;
    let has_backslash = backslash.wrapping_sub(ONES) & !backslash;
    let has_control = chunk.wrapping_sub(ONES * 0x20) & !chunk;
    (has_quote | has_backslash | has_control) & HIGHS
}

/// Returns the index of the first byte at or after `pos` that is `"`, `\`, or a control character.
/// Returns `bytes.len()` if there isn't one.
#[inline]
pub(crate) fn find_special(bytes: &[u8], mut pos: usize) -> usize {
    while let Some(chunk) = bytes.get(pos..pos + 8) {
        let chunk = u64::from_le_bytes(chunk.try_into().expect("chunk is 8 bytes"));
        let mask = special_mask(chunk);
        if mask != 0 {
            return pos + (mask.trailing_zeros() / 8) as usize;
        }
        pos += 8;
    }
    while pos < bytes.len() && !is_special(bytes[pos]) {
        pos += 1;
    }
    pos
}

#[cfg(test)]
mod tests {
    use super::*;

    fn find_special_slow(bytes: &[u8], pos: usize) -> usize {
        (pos..bytes.len())
            .find(|&i| is_special(bytes[i]))
            .unwrap_or(bytes.len())
    }

    #[test]
    fn matches_byte_by_byte_scan() {
        // every special byte at every position of a 20 byte buffer, surrounded by bytes that are
        // close to the special ones (to catch off by one errors in the bit tricks)
        let fillers = [
            b'a', b'!', b'#', b'[', b']', b' ', 0x7f, 0x80, 0xff, 0x21, 0x5d,
        ];
        let specials = [b'"', b'\\', 0x00, 0x01, 0x1f, b'\n'];
        for &filler in &fillers {
            for &special in &specials {
                for index in 0..20 {
                    let mut bytes = vec![filler; 20];
                    bytes[index] = special;
                    for start in 0..=20 {
                        assert_eq!(
                            find_special(&bytes, start),
                            find_special_slow(&bytes, start),
                            "filler={filler:#x} special={special:#x} index={index} start={start}"
                        );
                    }
                }
            }
            let bytes = vec![filler; 20];
            assert_eq!(find_special(&bytes, 0), 20);
        }
    }

    #[test]
    fn multiple_matches_return_the_first() {
        let bytes = b"abcdefg\x00\"\\xyz";
        assert_eq!(find_special(bytes, 0), 7);
        assert_eq!(find_special(bytes, 8), 8);
        assert_eq!(find_special(bytes, 9), 9);
        let text = "é🎉 plain text without specials";
        assert_eq!(find_special(text.as_bytes(), 0), text.len());
    }
}

use std::collections::BTreeMap;

use hyper::{HeaderMap, Request, Uri};

fn main() {
    println!("Hello, world!");
}

enum HttpMethod {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Head,
}

struct ArriRequestOptions {
    url: String,
    method: HttpMethod,
    params: String,
    headers: HeaderMap,
}

async fn arri_request(opts: ArriRequestOptions) -> Option<String> {
    let uri = opts.url.parse::<Uri>();
    if !uri.is_ok() {
        return None;
    }

    let req = Request::builder().uri(uri.unwrap());
    return Some("Hello world".to_string());
}

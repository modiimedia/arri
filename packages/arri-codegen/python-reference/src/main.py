import requests
import json
from enum import Enum
from typing import MutableMapping, Any, TypeVar, Callable, Union

TResponse = TypeVar("TResponse")

class HttpMethod(Enum):
    GET = 'get'
    HEAD = 'head'
    POST = 'post'
    PUT = 'put'
    PATCH = 'patch'
    DELETE = 'delete'

class ArriHttpRequestInput:
    url: str
    method: HttpMethod
    params: MutableMapping[str, Any]
    response: TResponse
    parser: Callable[[str], TResponse]

def arri_request(
    url: str,
    method: HttpMethod,
    params: Union[MutableMapping[str, Any], None] = None,
    headers: MutableMapping[str, str] = {},
    parser: Union[Callable[[str], TResponse], None] = None,
):
    finalUrl = url
    if method == HttpMethod.GET | method == HttpMethod.HEAD:
        urlParts = []
        for key in params:
            urlParts.append("%k=%v"%(key, params[key]))
        if urlParts.__len__ > 0:
            finalUrl = "%u?%q"%(finalUrl, "&".join(urlParts))
    print(finalUrl)
    response = requests.get(
        url=finalUrl,
        params=None,
        data = None,
        headers=headers,
        cookies=None,
        files=None,
        auth=None
    )

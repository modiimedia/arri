import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.*

fun main() {
    val http = HttpClient() {
        install(HttpTimeout)
    }
    val headers = mutableMapOf<String, String>()
    headers["x-test-header"] = "test";
    val client = TestClient(http, baseUrl = "http://127.0.0.1:2020", headers = headers)
    println("STARTING")
    val scope = CoroutineScope(Dispatchers.Default)
    val job = client.users.watchUser(
        scope,
        UserParams("12345"),
        onData = { user ->
            println(user.toString())
        },
        onConnectionError = {err ->
            println(err)
        }
    )
    Thread.sleep(10000)
    println("Cancelling job")
    job.cancel()
}
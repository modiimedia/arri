import io.ktor.client.*
import io.ktor.client.plugins.*
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

fun main() {
    val http = HttpClient() {
        install(HttpTimeout)
    }
    val headers = mutableMapOf<String, String>()
    headers["x-test-header"] = "test";
    val client = TestClient(http, baseUrl = "http://127.0.0.1:2020", headers = headers)
    runBlocking{
        client.users.watchUser(
            UserParams("12345"),
            onData = { user ->
                println(user.toString())
            },
        )
    }

//    Thread.sleep(10000)
//    println("Cancelling job")
//    job.cancel()

}
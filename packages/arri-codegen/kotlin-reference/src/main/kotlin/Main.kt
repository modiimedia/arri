import io.ktor.client.*
import kotlinx.coroutines.runBlocking

class Main {
    val http = HttpClient()
    val client = TestClient(http)

    fun start() {
        runBlocking {

        }
    }
}
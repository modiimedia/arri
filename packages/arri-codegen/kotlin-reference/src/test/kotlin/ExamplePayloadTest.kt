import kotlinx.serialization.json.JsonPrimitive
import org.junit.jupiter.api.Test
import java.time.Instant

class ExamplePayloadTest {

    @Test
    fun toJson() {
        val now = Instant.now()
        val input = ExamplePayload(
            string = "hello world",
            boolean = true,
            timestamp = now,
            float32 = 1.0F,
            float64 = 1.0,
            int8 = 1,
            uint8 = 1u,
            int16 = 10,
            uint16 = 10u,
            int32 = 100,
            uint32 = 100u,
            int64 = 1000L,
            uint64 = 1000UL,
            enum = ExampleEnum.Baz,
            _object = ExampleObject(id = "hello world 2", content = "hello world 2"),
            array = listOf(true, false, false),
            record = mapOf(Pair("A", true), Pair("B", false)),
            any = JsonPrimitive("hello world")
        )
    }
}
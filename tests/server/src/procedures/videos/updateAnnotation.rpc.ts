import { defineRpc } from "arri";
import { a } from "arri-validate";
import { Annotation } from "./getAnnotation.rpc";

export default defineRpc({
    params: a.object(
        {
            annotation_id: a.string(),
            annotation_id_version: a.string(),
            data: a.partial(a.omit(Annotation, ["annotation_id"]), {
                id: "UpdateAnnotationData",
            }),
        },
        {
            id: "UpdateAnnotationParams",
        },
    ),
    response: Annotation,
    handler({ params }) {
        return {
            annotation_id: {
                id: params.annotation_id,
                version: params.annotation_id_version,
            },
            associated_id: params.data.associated_id ?? {
                entity_type: "MOVIE_ID",
                id: "2",
            },
            annotation_type:
                params.data.annotation_type ?? "ANNOTATION_BOUNDINGBOX",
            annotation_type_version: params.data.annotation_type_version ?? 1,
            metadata: params.data.metadata ?? {},
            box_type_range: params.data.box_type_range ?? {
                start_time_in_nano_sec: BigInt("0"),
                end_time_in_nano_sec: BigInt("0"),
            },
        };
    },
});

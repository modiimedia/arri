import { defineRpc } from "arri";
import { a } from "arri-validate";

export const AnnotationId = a.object(
    {
        id: a.string(),
        version: a.string(),
    },
    {
        id: "AnnotationId",
    },
);

export const AssociatedId = a.object(
    {
        entity_type: a.stringEnum(["MOVIE_ID", "SHOW_ID"]),
        id: a.string(),
    },
    {
        id: "AssociatedId",
    },
);

export const Annotation = a.object(
    {
        annotation_id: AnnotationId,
        associated_id: AssociatedId,
        annotation_type: a.stringEnum(["ANNOTATION_BOUNDINGBOX"]),
        annotation_type_version: a.uint16(),
        metadata: a.any(),
        box_type_range: a.object({
            start_time_in_nano_sec: a.int64(),
            end_time_in_nano_sec: a.uint64(),
        }),
    },
    {
        id: "Annotation",
    },
);

export type Annotation = a.infer<typeof Annotation>;

export default defineRpc({
    method: "get",
    params: AnnotationId,
    response: Annotation,
    handler({ params }) {
        const result: Annotation = {
            annotation_id: {
                id: params.id,
                version: params.version,
            },
            associated_id: {
                id: "",
                entity_type: "MOVIE_ID",
            },
            annotation_type: "ANNOTATION_BOUNDINGBOX",
            annotation_type_version: 0,
            metadata: {},
            box_type_range: {
                start_time_in_nano_sec: BigInt("-99999999999999999"),
                end_time_in_nano_sec: BigInt("99999999999999999"),
            },
        };
        return result;
    },
});

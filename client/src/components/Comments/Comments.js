import React from "react"
import { useFormik } from "formik"
import * as yup from "yup"

const initialValues = { comment: "" }

const validationSchema = yup.object().shape({
    comment: yup.string().max(250, "The comment is too long."),
})

function Comments() {
    const onSubmit = (values, onSubmitProps) => {
        console.log("Comment:", values.comment)
        onSubmitProps.resetForm()
        onSubmitProps.setSubmitting(false)
    }

    const formik = useFormik({ initialValues, validationSchema, onSubmit })

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <input
                    type="text"
                    name="comment"
                    id="comment"
                    {...formik.getFieldProps("comment")}
                />
                {formik.touched.comment && formik.errors.comment ? (
                    <div>{formik.errors.comment}</div>
                ) : null}
                <button
                    type="submit"
                    disabled={!formik.isValid && formik.isSubmitting}
                >
                    Post
                </button>
            </form>
        </div>
    )
}

export default Comments

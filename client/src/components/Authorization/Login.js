import { useFormik } from "formik"
import React, { useContext } from "react"
import * as yup from "yup"
import { AuthorizationContext } from "../../index"
import { observer } from "mobx-react-lite"

const initialValues = {
    emailOrUsername: "",
    password: "",
}

const validationSchema = yup.object().shape({
    emailOrUsername: yup
        .string()
        .required("Required")
        .matches(
            /(?=.{3,50}$)/,
            "Email or username must be between 3 and 50 characters"
        )
        .test("is-valid", "Invalid username or email", (value) => {
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
            const usernameRegex = /^[a-zA-Z0-9_]+$/

            return emailRegex.test(value) || usernameRegex.test(value)
        }),
    password: yup
        .string()
        .matches(
            /(?=.*[A-Z])/,
            "Password must contain at least one uppercase letter"
        )
        .matches(/(?=.{6,20}$)/, "Password must be between 6 and 20 characters")
        .matches(
            /[ -/:-@[-`{-~]/,
            "Password must contain at least one special character"
        )
        .matches(/(?=.*[0-9])/, "Password must contain at least one digit")
        .required("Required"),
})

const Login = () => {
    const { store } = useContext(AuthorizationContext)

    const onSubmit = (values, onSubmitProps) => {
        store.login(
            values.emailOrUsername,
            values.emailOrUsername,
            values.password
        )
        onSubmitProps.resetForm()
    }

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
        validateOnBlur: true,
        validateOnChange: true,
    })

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <div>
                        <label htmlFor="emailOrUsername">
                            Email or Username
                        </label>
                    </div>
                    <br />
                    <input
                        type="text"
                        name="emailOrUsername"
                        id="emailOrUsername"
                        {...formik.getFieldProps("emailOrUsername")}
                    />
                    {formik.touched.emailOrUsername &&
                    formik.errors.emailOrUsername ? (
                        <div>{formik.errors.emailOrUsername}</div>
                    ) : null}
                </div>
                <div>
                    <div>
                        <label htmlFor="password">Password</label>
                    </div>
                    <br />
                    <input
                        type="password"
                        name="password"
                        id="password"
                        {...formik.getFieldProps("password")}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div>{formik.errors.password}</div>
                    ) : null}
                </div>
                <button type="submit" disabled={!formik.isValid}>
                    LOG IN
                </button>
            </form>
        </div>
    )
}

export default observer(Login)

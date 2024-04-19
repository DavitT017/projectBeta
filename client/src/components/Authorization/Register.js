import { useFormik } from "formik"
import React from "react"
import * as yup from "yup"

const initialValues = {
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
}

const validationSchema = yup.object().shape({
    email: yup
        .string()
        .required("Required")
        .matches(/(?=.{6,50}$)/, "Email must be between 6 and 50 characters")
        .email("Invalid email address"),
    username: yup
        .string()
        .required("Required")
        .matches(
            /(?=.{3,50}$)/,
            "Username must be between 3 and 50 characters"
        ),
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
    confirmPassword: yup
        .string()
        .required("Required")
        .oneOf([yup.ref("password"), null], "Passwords must match"),
})

const onSubmit = (values, onSubmitProps) => {
    console.log("Form values", values)
    onSubmitProps.resetForm()
}

const Register = () => {
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
                        <label htmlFor="email">Email</label>
                    </div>
                    <br />
                    <input
                        type="email"
                        name="email"
                        id="email"
                        {...formik.getFieldProps("email")}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div>{formik.errors.email}</div>
                    ) : null}
                </div>
                <div>
                    <div>
                        <label htmlFor="username">Username</label>
                    </div>
                    <br />
                    <input
                        type="text"
                        name="username"
                        id="username"
                        {...formik.getFieldProps("username")}
                    />
                    {formik.touched.username && formik.errors.username ? (
                        <div>{formik.errors.username}</div>
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
                <div>
                    <div>
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                    </div>
                    <br />
                    <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        {...formik.getFieldProps("confirmPassword")}
                    />
                    {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword ? (
                        <div>{formik.errors.confirmPassword}</div>
                    ) : null}
                </div>
                <button
                    type="submit"
                    disabled={!formik.isValid}
                    variant="ordinary"
                >
                    REGISTER
                </button>
            </form>
        </div>
    )
}

export default Register

import {
  Form,
  redirect,
  useActionData,
  useLocation,
  useNavigation,
} from "react-router-dom";
import axios from "axios";
import styles from "./LoginAndSignup.module.css";
import { LOGIN_URL, SUPABASE_API_KEY } from "../constants";
import { getUser } from "../utils/getUser";
// get
// post, put, patch, delete,

export async function loginLoader() {
  const user = await getUser();
  if (user === null) {
    return null;
  } else {
    return redirect("/");
  }
}

export async function loginAction({ request }) {
  const redirectTo = new URL(request.url).searchParams.get("redirectTo") || "/";

  const data = await request.formData();
  const credentials = {
    email: data.get("email"),
    password: data.get("password"),
  };

  try {
    const response = await axios.post(LOGIN_URL, JSON.stringify(credentials), {
      headers: {
        apikey: SUPABASE_API_KEY,
        "Content-Type": "application/json",
      },
    });
    const {
      access_token,
      refresh_token,
      expires_at,
      user: { id: user_id },
    } = response.data;

    const user = { access_token, refresh_token, expires_at, user_id };
    // localStorage
    // sessionStorage

    localStorage.setItem("user", JSON.stringify(user));
    // redirect to home page
    return redirect(redirectTo);
  } catch (error) {
    localStorage.removeItem("user");
    if (error.response.status === 400) {
      return { error: "Wrong username or password" };
    } else {
      return { error: error?.response?.data?.message || error.message };
    }
  }
}

function Login() {
  const navigation = useNavigation();
  const data = useActionData();
  const location = useLocation();
  const loginURL = location.pathname + location.search;
  const isSubmitting = navigation.state === "submitting";
  return (
    <div className={`container ${styles.formContainer}`}>
      <h2 className={styles.pageHeading}>
        Welcome Back! Login to continue learning
      </h2>
      <Form method="POST" action={loginURL} className={styles.form} replace>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="off"
          />
        </div>
        <div>
          <input
            type="submit"
            value={isSubmitting ? "submitting..." : "login"}
            disabled={isSubmitting}
          />
        </div>
        {data && data.error && <p>{data.error}</p>}
      </Form>
    </div>
  );
}
export default Login;

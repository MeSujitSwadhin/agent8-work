import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    const cookies = request.headers.get("Cookie");
    if (cookies && cookies.includes("access_token")) {
        return redirect("/dashboard");
    }
    return redirect("/signin");
}

export default function Index() {
    return null;
}

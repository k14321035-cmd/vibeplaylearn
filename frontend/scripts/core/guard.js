import { getMe } from "./auth.js";

const user = await getMe();
if (!user) {
  location.href = "../pages/login.html";
}

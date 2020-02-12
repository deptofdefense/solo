import { AuthAPI } from "./root";

export default class AuthApi {
  public static login() {
    return AuthAPI.post("/login/", {});
  }
}

import root from "./root";

export default class AuthApi {
  public static login() {
    return root.get("/logs/");
  }
}

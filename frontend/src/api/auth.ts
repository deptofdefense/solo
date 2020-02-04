import root from "./root";

export default class AuthApi {
  public static apiConnectivityTest() {
    // logs endpoint was created for testing connectivity
    return root.get("/logs/");
  }
}

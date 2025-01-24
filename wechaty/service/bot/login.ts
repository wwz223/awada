import { Contact, log } from "@juzi/wechaty";
import { bot } from "@/src/index";
import { WechatyUi } from "@/utils";

/** 登录 */
export const onLogin = async (user: Contact) => {
  console.log("🌰🌰🌰 login 🌰🌰🌰");

  return log.info("StarterBot", "%s login", user);
};

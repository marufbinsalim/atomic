import { Dimensions } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");

const hp = (percent) => {
  return (percent * deviceHeight) / 100;
};

const wp = (percent) => {
  return (percent * deviceWidth) / 100;
};

export { hp, wp };

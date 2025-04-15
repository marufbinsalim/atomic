import { ActivityIndicator } from "react-native";
import { theme } from "../constants/themes";

const Loading = ({ size = "large", color = theme.colors.primary }) => {
  return (
    <ActivityIndicator
      style={{ justifyContent: "center", alignItems: "center" }}
      size={size}
      color={color}
    />
  );
};

export default Loading;

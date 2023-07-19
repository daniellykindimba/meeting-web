import {
  ControlFilled,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type {RefineThemedLayoutV2HeaderProps} from "@refinedev/antd";
import {
  useGetIdentity,
  useGetLocale,
  useLogout,
  useSetLocale,
} from "@refinedev/core";
import {
  Avatar,
  Dropdown,
  Layout as AntdLayout,
  MenuProps,
  Space,
  Switch,
  theme,
  Typography,
} from "antd";
import React, {useContext, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {ColorModeContext} from "../../contexts/color-mode";
import {Link} from "react-router-dom";
import {UserData} from "../../interfaces";

const {Text} = Typography;
const {useToken} = theme;

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({sticky}) => {
  const {token} = useToken();
  const {i18n} = useTranslation();
  const locale = useGetLocale();
  const changeLanguage = useSetLocale();
  const {data: user} = useGetIdentity<UserData>();
  const {mode, setMode} = useContext(ColorModeContext);
  const {mutate: logout} = useLogout();

  const currentLocale = locale();

  const menuItems: MenuProps["items"] = [...(i18n.languages || [])]
    .sort()
    .map((lang: string) => ({
      key: lang,
      onClick: () => changeLanguage(lang),
      icon: (
        <span style={{marginRight: 8}}>
          <Avatar size={16} src={`/images/flags/${lang}.svg`} />
        </span>
      ),
      label: lang === "en" ? "English" : "German",
    }));

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const items: MenuProps["items"] = [
    {
      key: "profile-header",
      icon: <UserOutlined />,
      label: <Link to={"/profile"}>Profile</Link>,
    },
    {
      key: "control-header",
      icon: <ControlFilled />,
      label: <Link to={"/control"}>Control Panel</Link>,
      disabled: user?.isAdmin ? false : true,
    },
    {
      key: "settings-header",
      icon: <SettingOutlined />,
      label: <Link to={"/settings"}>Settings</Link>,
      disabled: false,
    },
    {
      key: "logout-header",
      label: <a onClick={() => logout()}>Logout</a>,
      icon: <LogoutOutlined />,
      disabled: false,
    },
  ];

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <Space style={{marginLeft: "8px"}} size="middle">
          <Dropdown
            menu={{items}}
            trigger={["click"]}
            overlayStyle={{width: "185px"}}
          >
            <a onClick={(e) => e.preventDefault()}>
              <span style={{marginRight: 10}}>
                {user?.email && <Text strong>{user.email}</Text>}
              </span>
              {user?.avatar ? (
                <Avatar icon={<UserOutlined />} alt={user?.email} />
              ) : (
                <Avatar icon={<UserOutlined />} alt={user?.email} />
              )}
            </a>
          </Dropdown>
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};

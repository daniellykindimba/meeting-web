import {
  Authenticated,
  LoginFormTypes,
  Refine,
  useNavigation,
} from "@refinedev/core";
import {RefineKbar, RefineKbarProvider} from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  notificationProvider,
  ThemedLayoutV2,
  ThemedSiderV2,
  ThemedTitleV2,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import {useTranslation} from "react-i18next";
import {BrowserRouter, Link, Outlet, Route, Routes} from "react-router-dom";
import {authProvider} from "./authProvider";
import {AppIcon} from "./components/app-icon";
import {Header} from "./components/header";
import {ColorModeContextProvider} from "./contexts/color-mode";

import {gqlDataProvider} from "./api";
import {GroupOutlined, HomeFilled, SettingFilled} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Row,
  theme,
  Typography,
} from "antd";
import MenuDivider from "antd/es/menu/MenuDivider";
import {MeetingsPage} from "./pages/meetings";
import {UsersPage} from "./pages/control/pages/users";
import {DepartmentsPage} from "./pages/control/pages/departments";
import {VenuesPage} from "./pages/control/pages/venues";
import {EventPage} from "./pages/event";
import {HomePage} from "./pages/home";
import {CommitteesPage} from "./pages/control/pages/committees";
import {ControlHome} from "./pages/control/pages";
import {VerifyOtpForm} from "./components/verify_otp";

// import {
//   bodyStyles,
//   containerStyles,
//   headStyles,
//   layoutStyles,
//   titleStyles,
// } from "./styles";

const {Text, Title} = Typography;
const {useToken} = theme;

function App() {
  const {token} = useToken();
  const {t, i18n} = useTranslation();
  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  const {push} = useNavigation();

  const getTitle = (collapsed: boolean) => {
    return (
      <>
        <ThemedTitleV2
          collapsed={collapsed}
          text="Meeting App"
          icon={<AppIcon />}
        />
      </>
    );
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <Refine
            authProvider={authProvider}
            dataProvider={gqlDataProvider}
            notificationProvider={notificationProvider}
            i18nProvider={i18nProvider}
            routerProvider={routerBindings}
            resources={[]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2
                      Header={() => <Header sticky />}
                      Sider={() => (
                        <ThemedSiderV2
                          fixed={true}
                          Title={({collapsed}) => getTitle(collapsed)}
                          render={(logout) => {
                            return (
                              <>
                                <Menu.Item key="home" icon={<HomeFilled />}>
                                  <Link to={"/"}>Home</Link>
                                </Menu.Item>
                                <Menu.Item
                                  key="meetings"
                                  icon={<GroupOutlined />}
                                >
                                  <Link to={"/meetings"}>Events</Link>
                                </Menu.Item>
                                <MenuDivider />
                                <Menu.Item
                                  key="settings"
                                  icon={<SettingFilled />}
                                >
                                  Settings
                                </Menu.Item>
                                {logout.logout}
                              </>
                            );
                          }}
                        />
                      )}
                      Title={({collapsed}) => (
                        <ThemedTitleV2
                          collapsed={collapsed}
                          text="Meeting App"
                          icon={<AppIcon />}
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route path="/">
                  <Route index element={<HomePage />} />
                </Route>
                <Route path="/home">
                  <Route index element={<HomePage />} />
                </Route>
                <Route path="/meetings">
                  <Route index element={<MeetingsPage />} />
                </Route>
                <Route path="/event/:id/view">
                  <Route index element={<EventPage />} />
                </Route>
                <Route path="/settings">
                  <Route
                    index
                    element={
                      <>
                        <Text>Settings</Text>
                      </>
                    }
                  />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>

              <Route
                element={
                  <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2
                      Header={() => <Header sticky />}
                      Sider={() => (
                        <ThemedSiderV2
                          fixed={true}
                          Title={({collapsed}) => getTitle(collapsed)}
                          render={(logout) => {
                            return (
                              <>
                                <Menu.Item key="home" icon={<HomeFilled />}>
                                  <Link to={"/control"}>Home</Link>
                                </Menu.Item>
                                <Menu.Item
                                  key="meetings"
                                  icon={<GroupOutlined />}
                                >
                                  <Link to={"/control/meetings"}>Meetings</Link>
                                </Menu.Item>

                                <Menu.Item key="users" icon={<GroupOutlined />}>
                                  <Link to={"/control/users"}>Users</Link>
                                </Menu.Item>

                                <Menu.Item
                                  key="committees"
                                  icon={<GroupOutlined />}
                                >
                                  <Link to={"/control/committees"}>
                                    Committees
                                  </Link>
                                </Menu.Item>

                                <Menu.Item
                                  key="settings"
                                  icon={<SettingFilled />}
                                >
                                  <Link to={"/control/departments"}>
                                    Departments
                                  </Link>
                                </Menu.Item>
                                <Menu.Item
                                  key="settings"
                                  icon={<SettingFilled />}
                                >
                                  <Link to={"/control/venues"}>Venues</Link>
                                </Menu.Item>
                                <MenuDivider />
                                <Menu.Item
                                  key="settings"
                                  icon={<SettingFilled />}
                                >
                                  <Link to={"/control/settings"}>Settings</Link>
                                </Menu.Item>
                                {logout.logout}
                              </>
                            );
                          }}
                        />
                      )}
                      Title={({collapsed}) => (
                        <ThemedTitleV2
                          collapsed={collapsed}
                          text="Meeting App"
                          icon={<AppIcon />}
                        />
                      )}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route path="/control">
                  <Route index element={<ControlHome />} />
                </Route>
                <Route path="/control/users">
                  <Route index element={<UsersPage />} />
                </Route>
                <Route path="/control/committees">
                  <Route index element={<CommitteesPage />} />
                </Route>
                <Route path="/control/departments">
                  <Route index element={<DepartmentsPage />} />
                </Route>
                <Route path="/control/venues">
                  <Route index element={<VenuesPage />} />
                </Route>
                <Route path="/control/meetings">
                  <Route index element={<MeetingsPage />} />
                </Route>
              </Route>

              <Route
                element={
                  <Authenticated fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={
                    <AuthPage
                      type="login"
                      title={
                        <ThemedTitleV2
                          collapsed={false}
                          text="Meeting App"
                          icon={<AppIcon />}
                        />
                      }
                      formProps={{
                        initialValues: {
                          email: "",
                          password: "",
                        },
                      }}
                    />
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <AuthPage
                      type="updatePassword"
                      title={
                        <ThemedTitleV2
                          collapsed={false}
                          text="Meeting App"
                          icon={<AppIcon />}
                        />
                      }
                    />
                  }
                />
                <Route
                  path="/register"
                  element={<AuthPage type="register" />}
                />
                <Route
                  path="/forgot-password"
                  element={
                    <AuthPage
                      title={
                        <ThemedTitleV2
                          collapsed={false}
                          text="Meeting App"
                          icon={<AppIcon />}
                        />
                      }
                      type="forgotPassword"
                    />
                  }
                />
                <Route path="/verify-otp" element={<VerifyOtpForm />} />
              </Route>
            </Routes>

            <RefineKbar />
            <UnsavedChangesNotifier />
            {/* <DocumentTitleHandler /> */}
          </Refine>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;

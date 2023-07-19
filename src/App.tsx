import {Authenticated, Refine} from "@refinedev/core";
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
import {
  GroupOutlined,
  HomeFilled,
  LogoutOutlined,
  SettingFilled,
} from "@ant-design/icons";
import {Menu, Typography} from "antd";
import MenuDivider from "antd/es/menu/MenuDivider";
import {MeetingsPage} from "./pages/meetings";
import {UsersPage} from "./pages/control/pages/users";
import {DepartmentsPage} from "./pages/control/pages/departments";
import {VenuesPage} from "./pages/control/pages/venues";
import {EventPage} from "./pages/event";

const {Text} = Typography;

function App() {
  const {t, i18n} = useTranslation();
  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
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
                      Sider={(props, logout) => (
                        <ThemedSiderV2
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
                                  <Link to={"/settings"}>Settings</Link>
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
                  <Route
                    index
                    element={
                      <>
                        <Text>Home</Text>
                      </>
                    }
                  />
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
                      Sider={(props) => (
                        <ThemedSiderV2
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
                  <Route
                    index
                    element={
                      <>
                        <Text>Control Home</Text>
                      </>
                    }
                  />
                </Route>
                <Route path="/control/users">
                  <Route index element={<UsersPage />} />
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
                  path="/register"
                  element={<AuthPage type="register" />}
                />
                <Route
                  path="/forgot-password"
                  element={<AuthPage type="forgotPassword" />}
                />
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

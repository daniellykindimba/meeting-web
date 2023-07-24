import {ThemedTitleV2} from "@refinedev/antd";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Typography,
  message,
} from "antd";
import {Link} from "react-router-dom";
import {AppIcon} from "../app-icon";
import {useNavigation} from "@refinedev/core";
import {authProvider} from "../../authProvider";
import {gqlDataProvider} from "../../api";

const {Title} = Typography;

interface formData {
  name: string;
  description: string;
}

interface Props {
  onFinish?: any;
}

export const VerifyOtpForm: React.FC<Props> = (props: Props) => {
  const {push} = useNavigation();

  return (
    <>
      <Layout style={{}}>
        <Row
          justify="center"
          align="middle"
          style={{
            height: "100vh",
          }}
        >
          <Col xs={22}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "32px",
                fontSize: "20px",
              }}
            >
              {
                <ThemedTitleV2
                  collapsed={false}
                  text="Meeting App"
                  icon={<AppIcon />}
                />
              }
            </div>
            <Card
              headStyle={{
                borderBottom: 0,
                padding: 0,
              }}
              bodyStyle={{
                padding: 0,
                marginTop: "32px",
              }}
              style={{
                ...{
                  maxWidth: "400px",
                  margin: "auto",
                  padding: "32px",
                  boxShadow:
                    "0px 2px 4px rgba(0, 0, 0, 0.02), 0px 1px 6px -1px rgba(0, 0, 0, 0.02), 0px 1px 2px rgba(0, 0, 0, 0.03)",
                },
              }}
              title={
                <Title
                  level={3}
                  style={{
                    ...{
                      textAlign: "center",
                      marginBottom: 0,
                      fontSize: "24px",
                      lineHeight: "32px",
                      fontWeight: 700,
                      overflowWrap: "break-word",
                      hyphens: "manual",
                      textOverflow: "unset",
                      whiteSpace: "pre-wrap",
                    },
                  }}
                >
                  Verify OTP
                </Title>
              }
            >
              <Form
                layout="vertical"
                // form={form}
                onFinish={async (values) => {
                  const {data} = await gqlDataProvider.custom!({
                    url: "",
                    method: "post",
                    meta: {
                      operation: "verifyOtp",
                      variables: {
                        email: {
                          value: localStorage.getItem("recover_email"),
                          type: "String",
                          required: true,
                        },
                        otp: {
                          value: values.otp,
                          type: "String",
                          required: true,
                        },
                      },
                      fields: ["success", "message"],
                    },
                  })
                    .catch((error) => {
                      console.log("error", error);
                      message.error(
                        "Something Went Wrong, Authentication Failed"
                      );
                      return {
                        data: null,
                      };
                    })
                    .then((data) => {
                      return data;
                    });

                  if (data) {
                    if (data.success === false) {
                      message.error(data.message);
                    }
                    // persist otp to local storage
                    localStorage.setItem("recover_otp", values.otp);
                    push("/change-password");
                  }
                }}
                requiredMark={false}
                initialValues={{
                  remember: false,
                }}
              >
                <Form.Item
                  name="otp"
                  label={"Verification Code"}
                  rules={[
                    {required: true},
                    {
                      type: "string",
                      message: "Invalid Verification Code",
                    },
                  ]}
                >
                  <Input size="large" placeholder={"Verification Code"} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" size="large" htmlType="submit" block>
                    Verify
                  </Button>
                </Form.Item>

                <div>
                  Have an account, <Link to={"/login"}>Login</Link>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

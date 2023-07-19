import {useGetIdentity} from "@refinedev/core";
import {Alert, Button, Checkbox, Form, Input, message} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../../../api";
import {DepartmentData, UserData} from "../../../../../interfaces";

interface formData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentsIds: number[];
  isStaff: boolean;
  isAdmin: boolean;
}

interface Props {
  onFinish: any;
}

export const CreateUserForm: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  const getDepartments = async () => {
    message.destroy();
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "departments",
        variables: {},
        fields: [
          "total",
          "page",
          {
            results: ["id", "name", "description"],
          },
        ],
      },
    })
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    if (data) {
      setDepartments(data.results);
    }
  };

  const createDepartment = async (values: formData) => {
    message.destroy();
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "createUser",
        variables: {
          firstName: {
            value: values.firstName,
            type: "String",
            required: true,
          },
          middleName: {
            value: values.middleName,
            type: "String",
            required: true,
          },
          lastName: {
            value: values.lastName,
            type: "String",
            required: true,
          },
          email: {
            value: values.email,
            type: "String",
            required: true,
          },
          phone: {
            value: values.phone,
            type: "String",
            required: true,
          },
          departmentsIds: {
            value: values.departmentsIds,
            type: "[Int]",
            required: true,
          },
          isAdmin: {
            value: values.isAdmin,
            type: "Boolean",
            required: false,
          },
          isStaff: {
            value: values.isStaff,
            type: "Boolean",
            required: false,
          },
        },
        fields: [
          "success",
          "message",
          {
            user: [
              "id",
              "firstName",
              "middleName",
              "lastName",
              "email",
              "phone",
              "avatar",
              "created",
              "updated",
              "isActive",
            ],
          },
        ],
      },
    })
      .catch((error) => {
        console.error(error);
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    if (data) {
      setLoading(false);
      if (data.success) {
        props.onFinish(data.user);
      } else {
        setErrorMessage(data.message);
      }
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);

  return (
    <>
      {errorMessage.length > 0 && (
        <Alert message={errorMessage} type="error" closable />
      )}
      <Form<formData>
        form={form}
        layout="vertical"
        onFinish={(values) => {
          values.isAdmin = isAdmin;
          values.isStaff = isStaff;
          values.departmentsIds = selectedDepartments;
          createDepartment(values);
        }}
        onFinishFailed={() => {
          message.error("Please fill all required fields");
        }}
        autoComplete="off"
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{required: true, message: "First Name!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Middle Name"
          name="middleName"
          rules={[{required: true, message: "Middle Name!"}]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{required: true, message: "Last Name!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[{required: true, message: "Email Address!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Mobile Phone Number"
          name="phone"
          rules={[{required: true, message: "Mobile Phone Number!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label=""
          name="isAdmin"
          rules={[{required: false, message: "Is Adminstrator!"}]}
          wrapperCol={{span: 16}}
        >
          <Checkbox onChange={(e) => setIsAdmin(e.target.checked)}>
            {" "}
            <span style={{marginLeft: 5}}>Is Adminstrator</span>
          </Checkbox>
        </Form.Item>

        <Form.Item
          label=""
          name="isStaff"
          rules={[{required: false, message: "Is Staff!"}]}
          wrapperCol={{span: 16}}
        >
          <Checkbox
            onChange={(e) => {
              setIsStaff(e.target.checked);
            }}
          >
            {" "}
            <span style={{marginLeft: 5}}>Is Staff</span>{" "}
          </Checkbox>
        </Form.Item>

        <div style={{marginBottom: 20}}>
          <h3>Departments</h3>
          {departments.map((department) => {
            return (
              <div>
                <Checkbox
                  value={department.id}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDepartments([
                        ...selectedDepartments,
                        department.id,
                      ]);
                    } else {
                      setSelectedDepartments(
                        selectedDepartments.filter((id) => id !== department.id)
                      );
                    }
                  }}
                >
                  {department.name}
                </Checkbox>
              </div>
            );
          })}
        </div>

        <Form.Item>
          <Button
            type="primary"
            style={{float: "left"}}
            onClick={() => form.resetFields()}
          >
            Clear
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{float: "right"}}
            loading={loading}
            disabled={loading}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

import {useGetIdentity} from "@refinedev/core";
import {Alert, Button, Form, Input, message} from "antd";
import {useState} from "react";
import {gqlDataProvider} from "../../../../../api";
import {UserData} from "../../../../../interfaces";

const {TextArea} = Input;

interface formData {
  name: string;
  description: string;
}

interface Props {
  onFinish: any;
}

export const CreateCommitteeForm: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const createDepartment = async (values: formData) => {
    message.destroy();
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "createCommittee",
        variables: {
          name: {
            value: values.name,
            type: "String",
            required: true,
          },
          description: {
            value: values.description,
            type: "String",
            required: true,
          },
        },
        fields: [
          "success",
          "message",
          {
            committee: [
              "id",
              "name",
              "description",
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
        props.onFinish(data.committee);
      } else {
        setErrorMessage(data.message);
      }
    }
  };

  return (
    <>
      {errorMessage.length > 0 && (
        <Alert message={errorMessage} type="error" closable />
      )}
      <Form<formData>
        form={form}
        layout="vertical"
        onFinish={(values) => {
          createDepartment(values);
        }}
        onFinishFailed={() => {
          message.error("Please fill all required fields");
        }}
        autoComplete="off"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{required: true, message: "Committee Name!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{required: true, message: "Committee Description!"}]}
        >
          <TextArea rows={8} size="large" />
        </Form.Item>

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

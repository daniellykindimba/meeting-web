import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import {UserData, VenueData} from "../../../interfaces";
import {PlusOutlined} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";

const {TextArea} = Input;

const {Option} = Select;

interface formData {
  name: string;
  description: string;
  capacity: string;
  venueType: string;
}

interface Props {
  onFinish: any;
}

export const CreateVenueForm: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [venueTypes, setVenueTypes] = useState<string[]>([]);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const createVenue = async (values: formData) => {
    setLoading(true);
    message.destroy();
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "createVenue",
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
          venueType: {
            value: values.venueType,
            type: "String",
            required: true,
          },
          capacity: {
            value: values.capacity,
            type: "Int",
            required: true,
          },
        },
        fields: [
          "success",
          "message",
          {
            venue: [
              "id",
              "name",
              "description",
              "venueType",
              "capacity",
              "created",
              "updated",
              "isActive",
            ],
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
      setLoading(false);
      if (data.success) {
        message.success(data.message);
        props.onFinish(data.venue);
      }
    }
  };

  const getVenueTypes = async () => {
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "venueTypes",
        variables: {},
        fields: ["data"],
      },
    })
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    if (data) {
      setVenueTypes(data.data);
    }
  };

  useEffect(() => {
    getVenueTypes();
  }, []);

  return (
    <>
      <Form<formData>
        form={form}
        layout="vertical"
        onFinish={(values) => {
          createVenue(values);
        }}
        onFinishFailed={() => {
          message.error("Please fill all required fields");
        }}
        autoComplete="off"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{required: true, message: "Venue Name!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{required: true, message: "Venue Description!"}]}
        >
          <TextArea rows={8} size="large" />
        </Form.Item>

        <Form.Item
          label="Venue Type"
          name="venueType"
          rules={[{required: true, message: "Venue Type!"}]}
        >
          <Select style={{width: "50%", margin: "0 8px"}} size="large">
            {venueTypes.map((venueType) => {
              return (
                <Option value={venueType} key={venueType}>
                  {venueType.charAt(0).toUpperCase() + venueType.slice(1)}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item
          label="Capacity"
          name="capacity"
          rules={[{required: true, message: "Capacity!"}]}
        >
          <InputNumber />
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
            disabled={loading}
            loading={loading}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

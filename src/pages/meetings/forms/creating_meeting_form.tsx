import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Tooltip,
  message,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import {UserData, VenueData} from "../../../interfaces";
import {PlusOutlined} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";
import {CreateVenueForm} from "../../venues/forms/create_venue_form";

const {TextArea} = Input;

const {Option} = Select;

interface formData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  venueId: number;
}

interface Props {
  onFinish: any;
}

export const CreateMeetingForm: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [venues, setVenues] = useState<VenueData[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [createVenueModal, setCreateVenueModal] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const createEvent = async (values: formData) => {
    message.destroy();
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "createEvent",
        variables: {
          title: {
            value: values.title,
            type: "String",
            required: true,
          },
          description: {
            value: values.description,
            type: "String",
            required: true,
          },
          startTime: {
            value: values.startTime,
            type: "String",
            required: true,
          },
          endTime: {
            value: values.endTime,
            type: "String",
            required: true,
          },
          venueId: {
            value: values.venueId,
            type: "Int",
            required: true,
          },
        },
        fields: [
          "success",
          "message",
          {
            event: [
              "id",
              "title",
              "description",
              "startTime",
              "endTime",
              "created",
              "updated",
              "isActive",
              {
                author: [
                  "id",
                  "email",
                  "phone",
                  "firstName",
                  "middleName",
                  "lastName",
                  "avatar",
                ],
              },
              {
                venue: [
                  "id",
                  "name",
                  "description",
                  "capacity",
                  "venueType",
                  "created",
                  "updated",
                ],
              },
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
      if (data.success) {
        props.onFinish(data.event);
      } else {
        setErrorMessage(data.message);
      }
    }
  };

  const getVenues = async () => {
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "venues",
        variables: {},
        fields: [
          "total",
          "page",
          "pages",
          {
            results: ["id", "name", "description", "venueType", "capacity"],
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
      setVenues(data.results);
    }
  };

  const getEventTypes = async () => {
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "eventTypes",
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
      setEventTypes(data.data);
    }
  };

  const onCreateVenueFinish = async (venue: VenueData) => {
    setCreateVenueModal(false);
    setVenues([...venues, venue]);
  };

  useEffect(() => {
    getVenues();
    getEventTypes();
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
          createEvent(values);
        }}
        onFinishFailed={() => {
          message.error("Please fill all required fields");
        }}
        autoComplete="off"
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{required: true, message: "Meeting Title!"}]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{required: true, message: "Meeting Description!"}]}
        >
          <TextArea rows={8} size="large" />
        </Form.Item>

        <Row>
          <Col span={24} style={{display: "flex"}}>
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{required: true, message: "Meeting Start Time!"}]}
            >
              <DatePicker showTime size="large" />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="endTime"
              rules={[{required: true, message: "Meeting End Time!"}]}
              style={{marginLeft: "10px"}}
            >
              <DatePicker showTime size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          labelCol={{span: 24}}
          label={
            <>
              <span>Venue</span>
              {user?.isAdmin && (
                <Tooltip title="Click to Create a New Venue">
                  <Button
                    size="small"
                    style={{marginLeft: "10px"}}
                    icon={<PlusOutlined />}
                    onClick={() => setCreateVenueModal(true)}
                  />
                </Tooltip>
              )}
            </>
          }
          name="venueId"
          rules={[{required: true, message: "Meeting Venue!"}]}
        >
          <Select
            style={{width: "50%", margin: "0 8px"}}
            size="large"
            allowClear
          >
            {venues.map((venue) => {
              return (
                <Option value={venue.id} key={venue.id}>
                  {venue.name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item
          label="Event Type"
          name="eventType"
          rules={[{required: true, message: "Event Type!"}]}
        >
          <Select style={{width: "50%", margin: "0 8px"}} size="large">
            {eventTypes.map((eventType) => {
              return (
                <Option value={eventType} key={eventType}>
                  {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            style={{float: "left"}}
            onClick={() => form.resetFields()}
          >
            Clear
          </Button>
          <Button type="primary" htmlType="submit" style={{float: "right"}}>
            Submit
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Creating Venue"
        open={createVenueModal}
        destroyOnClose={true}
        width={"30vw"}
        onOk={() => setCreateVenueModal(false)}
        onCancel={() => setCreateVenueModal(false)}
        footer={[]}
      >
        <CreateVenueForm onFinish={onCreateVenueFinish} />
      </Modal>
    </>
  );
};

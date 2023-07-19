import {
  CloseOutlined,
  FolderAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";
import {
  Alert,
  Avatar,
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Tooltip,
  message,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../api";
import {
  VenueData,
  UserData,
  EventData,
  EventAttendeeData,
} from "../../interfaces";
import {CreateVenueForm} from "../venues/forms/create_venue_form";
import {AddingMeetingAttendeesComponent} from "./adding_attendees";

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
  event?: EventData | null;
}

export const MeetingAttendeesListComponent: React.FC<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [attendees, setAttendees] = useState<EventAttendeeData[]>([]);
  const [addingAttendeeModal, setAddingAttendeeModal] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const getMeetingAttendees = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "eventAttendees",
        variables: {
          id: {
            value: props.event?.id,
            type: "Int",
            required: true,
          },
        },
        fields: [
          "total",
          "page",
          "pages",
          {
            results: [
              "id",
              {
                event: ["id"],
              },
              {
                attendee: [
                  "id",
                  "email",
                  "phone",
                  "firstName",
                  "middleName",
                  "lastName",
                  "avatar",
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

    console.log(data);
    if (data) {
      setAttendees(data.results);
      setTotal(data.total);
      setPage(data.page);
    }
    setLoading(false);
  };

  const removeAttendee = async (id: number) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "removeEventAttendee",
        variables: {
          eventId: {
            value: props.event?.id,
            type: "Int",
            required: true,
          },
          attendeeId: {
            value: id,
            type: "Int",
            required: true,
          },
        },
        fields: ["success", "message"],
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
        message.success(data.message);
        setAttendees(attendees.filter((attendee) => attendee.id !== id));
      } else {
        message.error(data.message);
      }
    }
    setLoading(false);
  };

  const onFinishAddingAttendee = async (attendee: EventAttendeeData) => {
    setAttendees([attendee, ...attendees]);
  };

  useEffect(() => {
    getMeetingAttendees();
  }, []);

  return (
    <>
      <Row>
        <Col span={14}>
          <Form
            name="basic"
            onFinish={(values) => {
              getMeetingAttendees(values.q, 1, limit);
            }}
            autoComplete="off"
          >
            <Form.Item
              name="q"
              rules={[{required: false, message: "Search Meetings!"}]}
            >
              <Input
                size="large"
                type="search"
                placeholder="Search ...."
                allowClear
              />
            </Form.Item>
          </Form>
        </Col>

        {user?.id === props.event?.author.id && (
          <Col span={10} style={{display: "flex", justifyContent: "flex-end"}}>
            <Button
              size="large"
              icon={<FolderAddOutlined />}
              onClick={() => setAddingAttendeeModal(true)}
              type="primary"
            >
              Add Attendee
            </Button>
          </Col>
        )}
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={attendees}
        renderItem={(attendee, index) => (
          <List.Item
            actions={[
              <Popconfirm
                title="Are you sure to Remove this user to the meeting?"
                description="Are you sure?"
                onConfirm={() => {
                  removeAttendee(attendee.id);
                }}
                onCancel={() => {
                  console.log("adding");
                }}
                okText="Remove"
                cancelText="No"
              >
                <Button icon={<CloseOutlined />}></Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                />
              }
              title={
                <a href="https://ant.design">
                  {attendee.attendee.firstName +
                    " " +
                    attendee.attendee.middleName +
                    " " +
                    attendee.attendee.lastName}
                </a>
              }
              description={
                attendee.attendee.email + " ===> " + attendee.attendee.phone
              }
            />
          </List.Item>
        )}
      />

      <Drawer
        title="Adding Attendee"
        placement="right"
        destroyOnClose={true}
        width={"40vw"}
        onClose={() => setAddingAttendeeModal(false)}
        open={addingAttendeeModal}
      >
        <AddingMeetingAttendeesComponent
          event={props.event}
          onFinish={onFinishAddingAttendee}
        />
      </Drawer>
    </>
  );
};

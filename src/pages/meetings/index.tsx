import {useGetIdentity, useNavigation} from "@refinedev/core";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Empty,
  Form,
  Grid,
  Input,
  MenuProps,
  Modal,
  Row,
  Space,
  Spin,
} from "antd";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {EventData, UserData} from "../../interfaces";
import {gqlDataProvider} from "../../api";
import {
  DeleteFilled,
  DownOutlined,
  EditFilled,
  FolderAddOutlined,
  FolderOpenFilled,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {CreateMeetingForm} from "./forms/creating_meeting_form";
import moment from "moment";
import {get} from "http";
import {MeetingAttendeesListComponent} from "./meeting_attendees_list";

interface Props {
  rand?: any;
}

export const MeetingsPage: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [events, setEvents] = useState<EventData[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [createNewMeetingModal, setCreateNewMeetingModal] = useState(false);
  const [eventAttendeesModal, setEventAttendeesModal] = useState(false);
  const {data: user} = useGetIdentity<UserData>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getMeetings = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "myEvents",
        variables: {},
        fields: [
          "total",
          "page",
          "pages",
          {
            results: [
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
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    if (data) {
      setEvents(data.results);
      setTotal(data.total);
      setPage(data.page);
      setLimit(pageSize);
    }
    setLoading(false);
  };

  const onCreateFinish = async (event: EventData) => {
    setCreateNewMeetingModal(false);
    setEvents([event, ...events]);
  };

  const getEventDropdownMenue = (event: EventData) => {
    const items: MenuProps["items"] = [
      {
        key: "1",
        label: <Button type="link">Attendees</Button>,
        icon: <UserOutlined />,
        onClick: () => {
          handleEventAttendeeesModal(event);
        },
      },
      {
        key: "2",
        label: <Button type="link">Edit</Button>,
        icon: <EditFilled />,
        disabled: user?.isAdmin || user?.id === event.author.id ? false : true,
      },
      {
        key: "3",
        label: (
          <Button type="link" danger>
            Delete
          </Button>
        ),
        disabled: true,
        icon: <DeleteFilled />,
      },
    ];

    return (
      <Dropdown menu={{items}} trigger={["click"]} placement="bottomRight">
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    );
  };

  const handleEventAttendeeesModal = (event: EventData) => {
    setEvent(event);
    setEventAttendeesModal(true);
  };

  useEffect(() => {
    getMeetings("", 1, 12);
  }, []);

  return (
    <>
      <Breadcrumb
        separator=">"
        items={[
          {
            title: <Link to={"/"}>Home</Link>,
          },
          {
            title: "Events",
          },
        ]}
      />

      <Row>
        <Col span={14}>
          <Form
            name="basic"
            onFinish={(values) => {
              getMeetings(values.q, 1, limit);
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

        <Col span={10} style={{display: "flex", justifyContent: "flex-end"}}>
          <Button
            size="large"
            icon={<FolderAddOutlined />}
            onClick={() => setCreateNewMeetingModal(true)}
            type="primary"
          >
            Create New Event
          </Button>
        </Col>
      </Row>

      {events.length === 0 && !loading && (
        <Empty description="Not Event Registered" />
      )}

      <Spin spinning={loading}>
        <Row>
          {events.map((event) => (
            <Col span={6}>
              <Card
                title={event.title}
                extra={[getEventDropdownMenue(event)]}
                actions={[
                  <Button
                    style={{float: "right", marginRight: 10}}
                    type="primary"
                    icon={<FolderOpenFilled />}
                    onClick={() => push("/event/" + event.id + "/view")}
                  >
                    Open
                  </Button>,
                ]}
              >
                <Descriptions column={1}>
                  <Descriptions.Item label="Venue">
                    {event.venue.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Capacity">
                    {event.venue.capacity}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Time">
                    {moment(event.startTime).format("MMMM Do YYYY, h:mm:ss a")}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Time">
                    {moment(event.endTime).format("MMMM Do YYYY, h:mm:ss a")}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      <Modal
        title="Event Attendees"
        open={createNewMeetingModal}
        destroyOnClose={true}
        width={"50vw"}
        onOk={() => setCreateNewMeetingModal(false)}
        onCancel={() => setCreateNewMeetingModal(false)}
        footer={[]}
      >
        <CreateMeetingForm onFinish={onCreateFinish} />
      </Modal>

      <Modal
        title={event?.title + " Attendees"}
        open={eventAttendeesModal}
        destroyOnClose={true}
        width={"50vw"}
        onOk={() => setEventAttendeesModal(false)}
        onCancel={() => setEventAttendeesModal(false)}
        footer={[]}
      >
        <MeetingAttendeesListComponent
          event={event}
          onFinish={() => {
            console.log("finished");
          }}
        />
      </Modal>
    </>
  );
};

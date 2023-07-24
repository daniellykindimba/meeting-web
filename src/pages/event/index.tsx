import {useGetIdentity, useNavigation} from "@refinedev/core";
import {
  Breadcrumb,
  Button,
  Card,
  Dropdown,
  Grid,
  MenuProps,
  Space,
  Tabs,
} from "antd";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {EventData, UserData} from "../../interfaces";
import {gqlDataProvider} from "../../api";
import {
  DeleteFilled,
  DownOutlined,
  EditFilled,
  UserOutlined,
} from "@ant-design/icons";
import {EventFeedsComponent} from "./components/feeds";
import {EventAgendasComponent} from "./components/agendas";
import {EventAttendeesComponent} from "./components/attendees";
import {EventDocumentsComponent} from "./components/documents";

const items = [
  // {label: "Event Feeds", children: <EventFeedsComponent />, key: "1"},
  {label: "Agendas", children: <EventAgendasComponent />, key: "2"},
  {
    label: "Documents",
    children: <EventDocumentsComponent />,
    key: "3",
  },
  {
    label: "Attendees",
    children: <EventAttendeesComponent />,
    key: "4",
  },
];

interface Props {
  rand?: any;
}

export const EventPage: React.FC<Props> = (props: Props) => {
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
            title: "Event",
          },
        ]}
      />

      <div style={{marginTop: 5}}>
        <Card style={{padding: 0}}>
          <Tabs
            type="card"
            onChange={() => {
              console.log("d");
            }}
            items={items}
          />
        </Card>
      </div>
    </>
  );
};

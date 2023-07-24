import {useGetIdentity, useNavigation} from "@refinedev/core";
import {
  Badge,
  BadgeProps,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Col,
  Descriptions,
  Grid,
  Modal,
  Row,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import type {CellRenderInfo} from "rc-picker/lib/interface";
import {EventData, UserData} from "../interfaces";
import {gqlDataProvider} from "../api";
import dayjs, {Dayjs} from "dayjs";
import {FolderOpenFilled, OrderedListOutlined} from "@ant-design/icons";
import {EventDetailsComponent} from "./event/components/event_details";
import {MyDocsComponent} from "./my_docs";
import {title} from "process";

interface TimelineData {
  type: string;
  content: string;
  date: string;
  id: number;
}

interface Props {
  rand?: any;
}

export const HomePage: React.FC<Props> = (props: Props) => {
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [datas, setDatas] = useState<TimelineData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventId, setEventId] = useState<number | null>(null);
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const {data: user} = useGetIdentity<UserData>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getEvents = async () => {
    setLoadingEvents(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "myTodaysEvents",
        variables: {},
        fields: [
          "page",
          "total",
          {
            results: [
              "id",
              "title",
              "description",
              "startTime",
              "endTime",
              "created",
              "updated",
              {
                author: [
                  "id",
                  "firstName",
                  "middleName",
                  "lastName",
                  "email",
                  "avatar",
                  "phone",
                ],
              },
              {
                venue: ["id", "name", "description", "capacity"],
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
    }
    setLoadingEvents(false);
  };

  const getListData = async (value: Dayjs, mode = "month") => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "timeline",
        variables: {
          fetchDate: {
            value: value.format("YYYY-MM-DD"),
            type: "String",
            required: true,
          },
          mode: {
            value: mode,
            type: "String",
            required: true,
          },
        },
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
      setDatas(data.data);
    }
    setLoading(false);
  };

  const getMonthData = (value: Dayjs) => {
    console.log("Month", value.month());
    if (value.month() === 8) {
      return 1394;
    }
  };

  const monthCellRender = (value: Dayjs) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  const dateCellRender = (value: Dayjs) => {
    return (
      <ul
        style={{
          listStyle: "none",
        }}
      >
        {datas
          .filter(
            (data) =>
              value.format("YYYY-MM-DD") ===
              dayjs(data.date).format("YYYY-MM-DD")
          )
          .map((item) => (
            <li
              key={item.content}
              onClick={() => {
                setEventTitle(item.content);
                handleEventDetailsView(item.id);
              }}
            >
              <Badge
                status={item.type as BadgeProps["status"]}
                text={item.content}
              />
            </li>
          ))}
      </ul>
    );
    return null;
  };

  const cellRender = (current: Dayjs, info: CellRenderInfo<Dayjs>) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  const handleEventDetailsView = (id: number) => {
    setEventId(id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    getEvents();
    getListData(dayjs());
  }, []);

  return (
    <>
      <Breadcrumb
        separator=">"
        items={[
          {
            title: <Link to={"/"}>Home</Link>,
          },
        ]}
      />

      <Row>
        <Col span={16}>
          <div>
            <Row>
              <Col span={24}>
                {events.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <h3>Upcoming Events ...</h3>
                    <Row>
                      {events.map((event) => {
                        return (
                          <Col span={6}>
                            <Card
                              title={event.title}
                              extra={[
                                <Tooltip title="Click to View Event Details">
                                  <Button
                                    type={"primary"}
                                    icon={<OrderedListOutlined />}
                                    style={{marginRight: 10}}
                                    onClick={() => {
                                      setEventTitle(event.title);
                                      handleEventDetailsView(event.id);
                                    }}
                                  ></Button>
                                </Tooltip>,
                                <Tooltip title="Click to Open Event Session">
                                  <Button
                                    type={"primary"}
                                    icon={<FolderOpenFilled />}
                                    onClick={() => {
                                      push("/event/" + event.id + "/view");
                                    }}
                                  ></Button>
                                </Tooltip>,
                              ]}
                            >
                              <Descriptions title="" column={1}>
                                <Descriptions.Item label="Venue">
                                  {event.venue?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Created By">
                                  <Tag color="green">
                                    {event.author?.firstName +
                                      " " +
                                      event.author?.middleName +
                                      " " +
                                      event.author?.lastName}
                                  </Tag>
                                </Descriptions.Item>
                              </Descriptions>
                              <Descriptions.Item label="Starts">
                                <Tag color="yellow" style={{fontSize: 14}}>
                                  {dayjs(event.startTime).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}
                                </Tag>
                              </Descriptions.Item>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                )}
              </Col>
            </Row>
            <div
              style={{
                maxHeight: "64vh",
                overflowY: "scroll",
              }}
            >
              <Spin spinning={loading}>
                <Calendar
                  mode="month"
                  cellRender={cellRender}
                  onPanelChange={(date, mode) => {
                    getListData(date, mode);
                  }}
                  onChange={(date) => {
                    getListData(date);
                  }}
                />
              </Spin>
            </div>
          </div>
        </Col>
        <Col span={8} style={{padding: 3}}>
          <Card title="Uploaded Documents">
            <div
              style={{
                maxHeight: "87vh",
                overflowY: "scroll",
              }}
            >
              <MyDocsComponent />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={eventTitle}
        open={isModalOpen}
        destroyOnClose={true}
        width={"40vw"}
        onOk={() => {
          setIsModalOpen(false);
        }}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        footer={[
          <Button
            type="primary"
            onClick={() => push("/event/" + eventId + "/view")}
          >
            Open
          </Button>,
        ]}
        bodyStyle={{padding: 0}}
      >
        <EventDetailsComponent eventId={eventId} />
      </Modal>
    </>
  );
};

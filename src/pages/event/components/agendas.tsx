import {CloseOutlined, FolderAddOutlined} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";
import {
  Avatar,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  message,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import {
  EventData,
  EventAttendeeData,
  UserData,
  EventAgendaData,
} from "../../../interfaces";
import {AddingMeetingAttendeesComponent} from "../../meetings/adding_attendees";
import { useParams } from "react-router-dom";

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
  rand?: any;
}

export const EventAgendasComponent: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [agendas, setAgendas] = useState<EventAgendaData[]>([]);
  const [agenda, setAgenda] = useState<EventAgendaData | null>(null);
  const [addingAgendaModal, setAddingAgendaModal] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  // get event id from url
  const {id} = useParams<{id: string}>();

  const getAgendas = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "eventAgendas",
        variables: {
          id: {
            value: parseInt(id?.toString() ?? "0"),
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
              "title",
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

    console.log(data);
    if (data) {
      setAgendas(data.results);
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
        setAgendas(agendas.filter((agenda) => agenda.id !== id));
      } else {
        message.error(data.message);
      }
    }
    setLoading(false);
  };

  const onFinishAddingAttendee = async (agenda: EventAgendaData) => {
    setAgendas([agenda, ...agendas]);
  };

  useEffect(() => {
    getAgendas();
  }, []);

  return (
    <>
      <Row>
        <Col span={14}>
          <Form
            name="basic"
            onFinish={(values) => {
              getAgendas(values.q, 1, limit);
            }}
            autoComplete="off"
          >
            <Form.Item
              name="q"
              rules={[{required: false, message: "Search Agenda!"}]}
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
              onClick={() => setAddingAgendaModal(true)}
              type="primary"
            >
              Add Agenda
            </Button>
          </Col>
        )}
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={agendas}
        renderItem={(agenda, index) => (
          <List.Item
            actions={[
              <Popconfirm
                title="Are you sure to Remove this user to the meeting?"
                description="Are you sure?"
                onConfirm={() => {
                  removeAttendee(agenda.id);
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
              title={<a>{agenda.title}</a>}
              description={agenda.description}
            />
          </List.Item>
        )}
      />

      <Modal
        title="Adding Agenda"
        destroyOnClose={true}
        width={"40vw"}
        onCancel={() => setAddingAgendaModal(false)}
        open={addingAgendaModal}
      >
        <AddingMeetingAttendeesComponent
          event={props.event}
          onFinish={onFinishAddingAttendee}
        />
      </Modal>
    </>
  );
};

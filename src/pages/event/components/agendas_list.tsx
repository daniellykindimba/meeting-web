import {useGetIdentity, useNavigation} from "@refinedev/core";
import {
  Avatar,
  Button,
  Col,
  Drawer,
  Form,
  Grid,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  message,
} from "antd";
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {gqlDataProvider} from "../../../api";
import {
  EventAgendaData,
  EventData,
  EventDocumentData,
  UserData,
} from "../../../interfaces";
import {
  UploadOutlined,
  ReadOutlined,
  DeleteFilled,
  PlusOutlined,
} from "@ant-design/icons";
import {UploadingMeetingDocumentForm} from "../../meetings/forms/uploading_meeting_document";
import {CreateMeetingAgendaFormComponent} from "../../meetings/forms/create_meeting_agenda_form";

interface Props {
  rand?: any;
  event?: EventData | null;
}

interface formData {
  q: string;
}

export const EventAgendasListComponent: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [agendas, setAgendas] = useState<EventAgendaData[]>([]);
  const [agenda, setAgenda] = useState<EventAgendaData | null>(null);
  const [createAgendaModal, setCreateAgendaModal] = useState(false);
  const [documentView, setDocumentView] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const getAgendas = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "eventAgendas",
        variables: {
          eventId: {
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

    if (data) {
      setAgendas(data.results);
      setTotal(data.total);
      setPage(data.page);
    }
    setLoading(false);
  };

  const deleteAgenda = async (id: number) => {
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "deleteEventAgenda",
        variables: {
          id: {
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
  };

  const onFinishCreate = async (agenda: EventAgendaData) => {
    setAgendas([agenda, ...agendas]);
    setCreateAgendaModal(false);
    message.success("Agenda Created Successfully");
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
              rules={[{required: false, message: "Search Agendas!"}]}
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
              icon={<PlusOutlined />}
              onClick={() => setCreateAgendaModal(true)}
              type="primary"
            >
              Create Agenda
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
                title="Delete the Document"
                description="Are you sure to delete this Document?"
                onConfirm={() => deleteAgenda(agenda.id)}
                onCancel={() => {
                  message.info("Document not deleted");
                }}
                okText="Yes"
                cancelText="No"
                disabled={user?.id !== props.event?.author.id}
              >
                <Button
                  icon={<DeleteFilled />}
                  disabled={user?.id !== props.event?.author.id}
                ></Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={<a>{agenda.title}</a>} />
          </List.Item>
        )}
      />

      <Modal
        title="Create Agenda"
        destroyOnClose={true}
        width={"40vw"}
        onCancel={() => setCreateAgendaModal(false)}
        open={createAgendaModal}
        footer={[]}
      >
        <CreateMeetingAgendaFormComponent
          event={props.event}
          onFinish={onFinishCreate}
        />
      </Modal>
    </>
  );
};

import {DeleteFilled, ReadOutlined, UploadOutlined} from "@ant-design/icons";
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
  Tag,
  message,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../api";
import {UserData, EventData, EventDocumentData} from "../../interfaces";
import {UploadingMeetingDocumentForm} from "./forms/uploading_meeting_document";

// import image

import PdfLogo from "../../images/pdf.png";
import moment from "moment";

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

export const MeetingDocumentsListComponent: React.FC<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [documents, setDocuments] = useState<EventDocumentData[]>([]);
  const [document, setDocument] = useState<EventDocumentData | null>(null);
  const [uploadingModal, setUploadingModal] = useState(false);
  const [documentView, setDocumentView] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const getEventDocuments = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "eventDocuments",
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
              "file",
              "created",
              "updated",
              "isActive",
              {
                event: ["id", "title", "description"],
              },
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
      setDocuments(data.results);
      setTotal(data.total);
      setPage(data.page);
    }
    setLoading(false);
  };

  const deleteDocument = async (id: number) => {
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "deleteEventDocument",
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
        setDocuments(documents.filter((document) => document.id !== id));
      } else {
        message.error(data.message);
      }
    }
  };

  const onFinishUploadd = async (document: EventDocumentData) => {
    setDocuments([document, ...documents]);
    setUploadingModal(false);
    message.success("Document Uploaded Successfully");
  };

  const handleDocumentView = (document: EventDocumentData) => {
    setDocument(document);
    setDocumentView(true);
  };

  useEffect(() => {
    getEventDocuments();
  }, []);

  return (
    <>
      <Row>
        <Col span={14}>
          <Form
            name="basic"
            onFinish={(values) => {
              getEventDocuments(values.q, 1, limit);
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
            icon={<UploadOutlined />}
            onClick={() => setUploadingModal(true)}
            type="primary"
          >
            Upload Document
          </Button>
        </Col>
      </Row>
      <List
        itemLayout="horizontal"
        dataSource={documents}
        renderItem={(document, index) => (
          <List.Item
            actions={[
              <Button
                icon={<ReadOutlined />}
                onClick={() => handleDocumentView(document)}
              ></Button>,

              <Popconfirm
                title="Delete the Document"
                description="Are you sure to delete this Document?"
                onConfirm={() => deleteDocument(document.id)}
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
            <List.Item.Meta
              avatar={<Avatar src={PdfLogo} />}
              title={<a>{document.title}</a>}
              description={
                <>
                  <p>{document.description}</p>
                  {document?.author && (
                    <Tag color="green">
                      Uploded By:{" "}
                      {document.author.firstName +
                        " " +
                        document.author.middleName +
                        " " +
                        document.author.lastName}
                    </Tag>
                  )}
                  {document?.event && (
                    <Tag color="green">Event: {document.event.title}</Tag>
                  )}
                  {document?.event && (
                    <Tag color="green">
                      Happening On:{" "}
                      {moment(document.event.startTime).format(
                        "DD MMM YYYY hh:mm A"
                      )}
                    </Tag>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Uploading Document"
        destroyOnClose={true}
        width={"40vw"}
        onCancel={() => setUploadingModal(false)}
        open={uploadingModal}
        footer={[]}
      >
        <UploadingMeetingDocumentForm
          event={props.event}
          onFinish={onFinishUploadd}
        />
      </Modal>

      <Drawer
        title="View Document"
        placement="right"
        width={"80vw"}
        onClose={() => setDocumentView(false)}
        open={documentView}
        bodyStyle={{padding: 0}}
      >
        <iframe
          src={document?.file}
          width="100%"
          height="100%"
          style={{border: "none"}}
        ></iframe>
      </Drawer>
    </>
  );
};

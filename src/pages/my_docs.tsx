import {useGetIdentity, useNavigation} from "@refinedev/core";
import {Avatar, Button, Drawer, Grid, List, Tag} from "antd";
import {useState, useEffect} from "react";
import {EventDocumentData, UserData} from "../interfaces";
import {gqlDataProvider} from "../api";
import {ReadOutlined} from "@ant-design/icons";
import PdfLogo from "../images/pdf.png";
import moment from "moment";

interface TimelineData {
  type: string;
  content: string;
  date: string;
  id: number;
}

interface Props {
  rand?: any;
}

export const MyDocsComponent: React.FC<Props> = (props: Props) => {
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<EventDocumentData[]>([]);
  const [document, setDocument] = useState<EventDocumentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {data: user} = useGetIdentity<UserData>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getDocuments = async () => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "myDocuments",
        variables: {},
        fields: [
          "page",
          "total",
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
                event: [
                  "id",
                  "title",
                  "description",
                  "startTime",
                  "endTime",
                  "created",
                  "updated",
                  "isActive",
                ],
              },
              {
                author: [
                  "id",
                  "email",
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
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    if (data) {
      setDocuments(data.results);
    }
    setLoading(false);
  };

  const handleDocumentView = (document: EventDocumentData) => {
    setDocument(document);
    setIsModalOpen(true);
  };

  useEffect(() => {
    getDocuments();
  }, []);

  return (
    <>
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

      <Drawer
        title={document?.title}
        open={isModalOpen}
        destroyOnClose={true}
        width={"80vw"}
        onClose={() => {
          setIsModalOpen(false);
        }}
        footer={[]}
      >
        <iframe src={document?.file} width="100%" height="100%" />
      </Drawer>
    </>
  );
};

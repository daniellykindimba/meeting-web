import {
  FolderAddOutlined,
  InboxOutlined,
  PlusCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";
import {
  Avatar,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  List,
  Popconfirm,
  Row,
  Select,
  SelectProps,
} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import Dragger from "antd/es/upload/Dragger";
import {EventData} from "../../../interfaces";

const {TextArea} = Input;

const {Option} = Select;

interface formData {
  title: string;
  description: string;
  file: string;
}

interface Props {
  onFinish: any;
  event?: EventData | null;
}

const options: SelectProps["options"] = [];

export const UploadingMeetingDocumentForm: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  //   define a form
  const [form] = Form.useForm<formData>();

  const uploadDocument = async (values: formData) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "createEventDocument",
        variables: {
          eventId: {
            value: props.event?.id,
            required: true,
            type: "Int",
          },
          title: {
            value: values.title,
            required: true,
            type: "String",
          },
          description: {
            value: values.description,
            required: false,
            type: "String",
          },
          file: {
            value: values.file,
            required: true,
            type: "Upload",
          },
        },
        fields: [
          "success",
          "message",
          {
            eventDocument: [
              "id",
              "title",
              "description",
              "file",
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
      props.onFinish(data?.eventDocument);
    }
    setLoading(false);
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Form<formData>
            form={form}
            layout="vertical"
            onFinish={(values) => {
              console.log(values);
              uploadDocument(values);
            }}
            autoComplete="off"
          >
            <Form.Item
              label="Document Title"
              name="title"
              rules={[{required: true, message: "Document Title"}]}
            >
              <Input
                size="large"
                type="text"
                placeholder="Document Title ...."
              />
            </Form.Item>

            <Form.Item
              label="Document Description"
              name="description"
              rules={[{required: false, message: "Document Description"}]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="Document File"
              name="file"
              rules={[
                {
                  required: true,
                  message: "Please upload a file",
                },
              ]}
            >
              <Dragger
                multiple={false}
                beforeUpload={(file) => {
                  if (!form.getFieldValue("title")) {
                    form.setFieldValue("title", file.name);
                  }

                  return false;
                }}
                onChange={(info) => {
                  console.log(info);
                }}
                accept=".pdf"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
            </Form.Item>

            <Form.Item>
              <Button
                style={{float: "right"}}
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                Upload Document
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </>
  );
};

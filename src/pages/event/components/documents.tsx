import {useGetIdentity, useNavigation} from "@refinedev/core";
import {Grid, Spin} from "antd";
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {gqlDataProvider} from "../../../api";
import {EventData, UserData} from "../../../interfaces";
import {MeetingDocumentsListComponent} from "../../meetings/meeting_documents_list";

interface Props {
  rand?: any;
}

export const EventAgendasComponent: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [events, setEvents] = useState<EventData[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [createNewMeetingModal, setCreateNewMeetingModal] = useState(false);
  const [eventAttendeesModal, setEventAttendeesModal] = useState(false);
  const {data: user} = useGetIdentity<UserData>();

  //   get event id from url
  const {id} = useParams<{id: string}>();

  const {push} = useNavigation();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const getEvent = async () => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!<EventData>({
      url: "",
      method: "get",
      meta: {
        operation: "event",
        variables: {
          id: {
            value: parseInt(id?.toString() ?? "0"),
            type: "Int",
            required: true,
          },
        },
        fields: [
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
    })
      .catch((error) => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    console.log(data);
    if (data) {
      setEvent(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getEvent();
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        {event && (
          <MeetingDocumentsListComponent
            event={event}
            onFinish={() => {
              console.log("finished");
            }}
          />
        )}
      </Spin>
    </>
  );
};

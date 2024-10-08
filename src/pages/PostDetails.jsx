import LoadingScreen from "@/components/LoadingScreen";
import MoreBlogsContainer from "@/components/MoreBlogsContainer";
import NoPostsFound from "@/components/NoPostsFound";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/constants/Constants";
import { AuthContext } from "@/contexts/AuthContext";
import axios from "axios";
import JoditEditor from "jodit-react";
import { CircleChevronUp, FilePenLine, Trash2 } from "lucide-react";
import moment from "moment";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import ScrollToTop from "react-scroll-to-top";

const PostDetails = () => {
  const navigate = useNavigate();
  const editor = useRef(null);
  const { id: postId } = useParams();
  const [postData, setPostData] = useState([]);
  const { authUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [imageLoad, setImageLoad] = useState(false);

  const config = useMemo(
    () => ({
      readonly: true,
      toolbar: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      toolbarInlineForSelection: true,
      showPlaceholder: false,
    }),
    []
  );

  const getPostData = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}`, {
        withCredentials: true,
      });
      if (response.data.status === 200) {
        setPostData(response.data.data);
      } else if (response.data.status === 403) {
        toast.error(response.data.message);
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error: ", error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      getPostData();
    }
  }, [postId]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!loading && postData === 0) {
    return <NoPostsFound />;
  }

  const handleDeletePost = async () => {
    try {
      await axios
        .delete(`${API_URL}/posts/${postData._id}`, { withCredentials: true })
        .then((response) => {
          toast.success(response.data.message);
          navigate("/");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkImageLoad = () => {
    setImageLoad(true);
  };

  return (
    <div>
      {postData && (
        <section className="max-w-7xl mx-auto px-4 mt-10 mb-6 border border-2-secondary rounded-md p-2 flex flex-col items-center">
          {/* Blog Post Page Heading with Title, Short desc and date */}
          <div className="flex flex-col items-center justify-center">
            <ScrollToTop
              className="!bg-secondary"
              smooth
              width="36"
              height="36"
              component={
                <span className="flex items-center justify-center">
                  <CircleChevronUp className="text-primary" />
                </span>
              }
            />
            <h1 className="max-w-[280px] md:max-w-xl lg:max-w-3xl xl:max-w-5xl text-xl sm:text-3xl md:text-5xl mt-4 font-semibold text-center text-ellipsis overflow-hidden ...">
              {postData.title}
            </h1>
            <h6 className="max-w-[280px] md:max-w-xl lg:max-w-3xl xl:max-w-5xl text-sm sm:text-lg mt-8 text-center text-ellipsis overflow-hidden ...">
              {postData.shortDescription}
            </h6>
          </div>

          {authUser && authUser._id === postData.author._id && (
            <div className="flex float-right m-2 gap-2">
              <Link to={`/posts/${postData._id}/edit`}>
                <Button variant="secondary">
                  <FilePenLine />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove
                      your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Blog post Image */}
          <div className="mt-10 flex justify-center items-center mx-auto">
            {!imageLoad && (
              <>
                <div className="flex flex-col">
                  <Skeleton className="h-[100px] w-[250px] sm:h-[200px] sm:w-[500px] md:h-[300px] md:w-[750px] lg:h-[400px] lg:w-[1000px] rounded-xl" />
                </div>
              </>
            )}
            <img
              src={postData.image}
              alt={`${postData.title} image`}
              onLoad={checkImageLoad}
              className={`${imageLoad ? "" : "hidden"}`}
            />
          </div>

          {/* Author Details */}
          <div className="mt-6 border border-2-secondary rounded-md p-2 flex justify-between items-center w-full">
            <div className="flex items-center gap-x-4 ml-2">
              <div>
                <Link to={`/profile/${postData.author._id}`}>
                  <Avatar className="scale-110">
                    <AvatarImage
                      src={
                        postData && postData.author.profilePic
                          ? postData.author.profilePic
                          : `https://avatar.iran.liara.run/username?username=${postData.author.username}`
                      }
                      className="!object-cover"
                    />
                    <AvatarFallback>
                      {postData.author.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
              <div>
                <Link to={`/profile/${postData.author._id}`}>
                  <p className="text-sm sm:text-lg font-bold text-primary">
                    {postData.author.fullName}
                  </p>
                  <span className="text-xs sm:text-lg text-muted-foreground font-semibold">
                    @{postData.author.username}
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center justify-center mr-2">
              <div>
                <p className="text-sm sm:text-lg text-muted-foreground font-semibold">
                  {postData.views} views
                </p>
                <h6 className="text-sm text-muted-foreground font-medium">
                  {moment(postData.createdAt).fromNow()}
                </h6>
              </div>
            </div>
          </div>

          {/* Blog post content */}
          <div className="m-4 w-full">
            <JoditEditor
              className="text-black border border-1-secondary rounded-lg p-4"
              ref={editor}
              config={config}
              value={postData.content}
            />
          </div>
        </section>
      )}

      <Separator />

      {/* Blog post page related blogs */}
      {authUser && (
        <section className="w-full px-8 md:px-20 mt-20 mb-8">
          <MoreBlogsContainer heading={"More from our Blogs"} />
        </section>
      )}
    </div>
  );
};

export default PostDetails;

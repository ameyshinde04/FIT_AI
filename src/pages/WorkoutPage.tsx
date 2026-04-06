import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AgeGroup, WorkoutRecord, Exercise } from "../../types";
import { speak } from "../services/speechService";
import {
  Timer,
  Zap,
  ChevronRight,
  X,
  Play,
  Activity,
  Flame,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Props {
  selectedAgeGroup: AgeGroup | null;
  onWorkoutComplete?: (record: WorkoutRecord) => void;
}

const WorkoutPage: React.FC<Props> = ({
  selectedAgeGroup,
  onWorkoutComplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const workoutSequence = (location.state?.sequence as Exercise[]) || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeExercise = workoutSequence[currentIdx];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const isMounted = useRef(false);
  const isInit = useRef(false);

  // New refs to track status inside closures (timeout) without stale state issues
  const isModelLoadedRef = useRef(false);
  const hasErrorRef = useRef(false);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState("Position yourself...");
  const [formScore, setFormScore] = useState(0);
  const [cameraHint, setCameraHint] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPhaseTransition, setShowPhaseTransition] = useState(true);

  // Refs for logic inside the callback loop to prevent dependency churn
  const showPhaseTransitionRef = useRef(true);
  const exerciseState = useRef<"up" | "down" | "in" | "out" | "none">("up");
  const lastHintSpoken = useRef<string | null>(null);
  const lastSpeakTime = useRef<number>(0);
  const feedbackTimer = useRef<number | null>(null);
  const holdStartTime = useRef<number | null>(null);
  const lastRepTime = useRef(0);
  const activeExerciseIdRef = useRef<string>("");

  // Sync refs with state
  useEffect(() => {
    showPhaseTransitionRef.current = showPhaseTransition;
  }, [showPhaseTransition]);

  useEffect(() => {
    if (activeExercise) {
      activeExerciseIdRef.current = activeExercise.id;
      setRepCount(0); // Reset rep count when exercise changes
      setFormScore(0);
      exerciseState.current = "up";
      holdStartTime.current = null;
    }
  }, [activeExercise]);

  // Timer for workout duration
  useEffect(() => {
    isMounted.current = true;
    const timer = setInterval(() => {
      if (isMounted.current && !showPhaseTransition) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, [showPhaseTransition]);

  // Periodic Voice Motivation
  useEffect(() => {
    const motivationInterval = setInterval(() => {
      if (!showPhaseTransition && isModelLoaded) {
        const messages = [
          "Keep breathing",
          "You're doing great",
          "Stay focused",
          "Maintain your form",
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        throttleSpeak(randomMsg, 4000); // Higher throttle for motivation
      }
    }, 30000); // Every 30 seconds
    return () => clearInterval(motivationInterval);
  }, [showPhaseTransition, isModelLoaded]);

  // Voice Guide for Phase Transition
  useEffect(() => {
    if (showPhaseTransition && activeExercise) {
      speak(
        `Next up is ${activeExercise.name}. ${activeExercise.description}. Get ready.`,
      );
    }
  }, [showPhaseTransition, activeExercise]);

  const throttleSpeak = (msg: string, delay = 1500) => {
    const now = Date.now();
    if (now - lastSpeakTime.current > delay) {
      speak(msg);
      lastSpeakTime.current = now;
    }
  };

  const calculateAngle = (a: any, b: any, c: any) => {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

    const cosine = dot / (magAB * magCB + 1e-6);
    const angle = Math.acos(Math.min(Math.max(cosine, -1), 1));

    return (angle * 180) / Math.PI;
  };

  const angleHistory = useRef<{ [key: string]: number[] }>({});

  const getSmoothedAngle = (key: string, newAngle: number) => {
    if (!angleHistory.current[key]) {
      angleHistory.current[key] = [];
    }

    const arr = angleHistory.current[key];
    arr.push(newAngle);

    if (arr.length > 5) arr.shift(); // keep last 5 frames

    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    return avg;
  };

  const isStable = (...points: any[]) =>
    points.every((p) => p && p.visibility > 0.7);

  const calculateFormScore = (checks: boolean[]) => {
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
  };

  // Stable callback that doesn't change when state changes
  const onResults = useCallback((results: any) => {
    console.log("POSE RUNNING");
    // Check ref instead of state to avoid recreating callback
    if (!isMounted.current || !canvasRef.current || !results.poseLandmarks)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    const video = videoRef.current;

    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const win = window as any;

    // Draw simplified skeleton
    if (win.drawConnectors && win.POSE_CONNECTIONS) {
      win.drawConnectors(ctx, results.poseLandmarks, win.POSE_CONNECTIONS, {
        color: "rgba(255, 255, 255, 0.6)",
        lineWidth: 4,
      });
    }
    if (win.drawLandmarks) {
      win.drawLandmarks(ctx, results.poseLandmarks, {
        color: "#3b82f6",
        lineWidth: 4,
        radius: 6,
      }); // Blue nodes
    }

    const landmarks = results.poseLandmarks;

    // Helper to get landmark by index
    const getL = (idx: number) => landmarks[idx];

    // Common landmarks
    const lShoulder = getL(11);
    const rShoulder = getL(12);
    const lElbow = getL(13);
    const rElbow = getL(14);
    const lWrist = getL(15);
    const rWrist = getL(16);
    const lHip = getL(23);
    const rHip = getL(24);
    const lKnee = getL(25);
    const rKnee = getL(26);
    const lAnkle = getL(27);
    const rAnkle = getL(28);

    // 🧠 CAMERA GUIDANCE SYSTEM

    let hint: string | null = null;

    // Check visibility (full body)
    const visiblePoints = [
      lShoulder,
      rShoulder,
      lHip,
      rHip,
      lKnee,
      rKnee,
      lAnkle,
      rAnkle,
    ].filter((p) => p && p.visibility > 0.6).length;

    if (visiblePoints < 6) {
      hint = "Show full body";
    }

    // Distance check (too close / far)
    const bodyHeight = Math.abs((lShoulder?.y || 0) - (lAnkle?.y || 1));

    if (bodyHeight > 0.7) {
      hint = "Move back";
    } else if (bodyHeight < 0.35) {
      hint = "Move closer";
    }

    // Center alignment
    const centerX = (lHip?.x + rHip?.x) / 2;

    if (centerX < 0.3) {
      hint = "Move right";
    } else if (centerX > 0.7) {
      hint = "Move left";
    }

    // Apply hint
    setCameraHint(hint);

    // 🔊 Speak only when hint changes
    if (hint && lastHintSpoken.current !== hint) {
      throttleSpeak(`Please ${hint.toLowerCase()}`, 2000);
      lastHintSpoken.current = hint;
    }

    const isFrontView =
      lShoulder &&
      rShoulder &&
      lHip &&
      rHip &&
      Math.abs(lShoulder.x - rShoulder.x) > 0.25 &&
      Math.abs(lHip.x - rHip.x) > 0.2;

    const exerciseId = activeExerciseIdRef.current;

    const isSideExercise =
      exerciseId.includes("_sq") || // squats
      exerciseId.includes("_pu") || // pushups
      exerciseId.includes("_kp") || // knee pushups
      exerciseId.includes("_pl") || // plank
      exerciseId.includes("_ln") || // lunges
      exerciseId.includes("_bd") || // bird dog
      exerciseId.includes("_gb") || // glute bridge
      exerciseId.includes("_sl"); // seated leg raise

    const isFrontExercise =
      exerciseId.includes("_hk") || // high knees
      exerciseId.includes("_jj") || // jumping jacks
      exerciseId.includes("_hr") || // heel raises
      exerciseId.includes("_ar"); // arm raises

    if (isSideExercise && isFrontView) {
      setCameraHint("Turn sideways");

      if (lastHintSpoken.current !== "Turn sideways") {
        throttleSpeak("Turn sideways", 2000);
        lastHintSpoken.current = "Turn sideways";
      }
    } else if (isFrontExercise && !isFrontView) {
      setCameraHint("Face the camera");

      if (lastHintSpoken.current !== "Face the camera") {
        throttleSpeak("Face the camera", 2000);
        lastHintSpoken.current = "Face the camera";
      }
    }

    const handleRep = (newFeedback: string, score?: number) => {
      setRepCount((prev) => {
        const nextCount = prev + 1;

        // 🎤 AI COACH VOICE
        if (score !== undefined) {
          if (score > 85) {
            throttleSpeak("Perfect rep!");
          } else if (score > 70) {
            throttleSpeak("Good job!");
          } else {
            throttleSpeak("Improve your form");
          }
        } else {
          throttleSpeak(String(nextCount));
        }

        return nextCount;
      });

      setFeedback(newFeedback);

      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = window.setTimeout(
        () => setFeedback("Keep going..."),
        1500,
      );
    };

    const drawGlow = (landmark: any, color = "rgba(59, 130, 246, 0.4)") => {
      if (!landmark) return;
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        20,
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = color;
      ctx.fill();
    };

    // EXERCISE SPECIFIC LOGIC
    if (exerciseId === "c_jj") {
      // Jumping Jacks
      if (isStable(lWrist, rWrist, lAnkle, rAnkle)) {
        drawGlow(lWrist);
        drawGlow(rWrist);
        drawGlow(lAnkle);
        drawGlow(rAnkle);

        const wristDist = Math.abs(lWrist.x - rWrist.x);
        const ankleDist = Math.abs(lAnkle.x - rAnkle.x);
        const wristsAboveHead =
          lWrist.y < lShoulder.y && rWrist.y < rShoulder.y;

        if (wristsAboveHead && ankleDist > 0.25) {
          if (exerciseState.current !== "out") {
            exerciseState.current = "out";
          }
        } else if (
          wristDist < 0.2 &&
          ankleDist < 0.15 &&
          lWrist.y > lShoulder.y
        ) {
          if (exerciseState.current === "out") {
            handleRep("Great Jump!");
            exerciseState.current = "in";
          }
        }
      }
    } else if (exerciseId === "y_sq") {
      if (isStable(lHip, lKnee, lAnkle, lShoulder)) {
        const kneeAngle = getSmoothedAngle(
          "squat_knee",
          calculateAngle(lHip, lKnee, lAnkle),
        );

        const backAngle = calculateAngle(lShoulder, lHip, lKnee);

        const isDeep = kneeAngle < 100;
        const isStraight = backAngle > 150;

        const score = calculateFormScore([isDeep, isStraight]);
        setFormScore(score);

        if (!isStraight) {
          setFeedback("Straighten back!");
          throttleSpeak("Keep your back straight", 2000);
          return;
        }

        if (kneeAngle > 110 && kneeAngle < 150) {
          throttleSpeak("Go deeper", 2500);
        }

        if (isDeep) {
          exerciseState.current = "down";
        } else if (kneeAngle > 160 && exerciseState.current === "down") {
          if (score > 70) {
            handleRep(`Strong Squat! (${score}%)`, score);
          } else {
            setFeedback(`Too shallow (${score}%)`);
          }

          exerciseState.current = "up";
        }
      }
    } else if (exerciseId === "y_pu" || exerciseId === "c_kp") {
      if (isStable(lShoulder, lElbow, lWrist, lHip, lKnee)) {
        const elbowAngle = getSmoothedAngle(
          "pushup_elbow",
          calculateAngle(lShoulder, lElbow, lWrist),
        );

        const bodyAngle = calculateAngle(lShoulder, lHip, lKnee);

        // ✅ checks
        const isDeep = elbowAngle < 90;
        const isStraight = bodyAngle > 160;

        const score = calculateFormScore([isDeep, isStraight]);
        setFormScore(score);

        if (!isStraight) {
          setFeedback("Keep body straight!");
          throttleSpeak("Keep your body straight", 2000);
          return;
        }

        if (elbowAngle > 120) {
          throttleSpeak("Go lower", 2500);
        }

        if (isDeep) {
          exerciseState.current = "down";
        } else if (elbowAngle > 155 && exerciseState.current === "down") {
          if (score > 70) {
            handleRep(`Great Push-up! (${score}%)`, score);
          } else {
            setFeedback(`Bad form (${score}%)`);
          }

          exerciseState.current = "up";
        }
      }
    } else if (exerciseId === "c_hk") {
      const hip = isStable(lHip) ? lHip : isStable(rHip) ? rHip : null;
      const lK = isStable(lKnee) ? lKnee : null;
      const rK = isStable(rKnee) ? rKnee : null;

      if (hip && (lK || rK)) {
        const activeKnee = lK && (!rK || lK.y < rK.y) ? lK : rK;
        const now = Date.now();

        const isHigh = activeKnee && activeKnee.y < hip.y - 0.05;

        if (isHigh) {
          const score = calculateFormScore([isHigh]);
          setFormScore(score);
          if (now - lastRepTime.current > 300) {
            // prevent spam
            handleRep("High Knee!");
            lastRepTime.current = now;
          }
        }
      }
    } else if (exerciseId === "y_ln") {
      if (isStable(lHip, lKnee, lAnkle, lShoulder)) {
        const kneeAngle = getSmoothedAngle(
          "lunge_knee",
          calculateAngle(lHip, lKnee, lAnkle),
        );

        const backAngle = calculateAngle(lShoulder, lHip, lKnee);

        const isDeep = kneeAngle < 110;
        const isStraight = backAngle > 150;

        const score = calculateFormScore([isDeep, isStraight]);
        setFormScore(score);

        if (!isStraight) {
          setFeedback("Keep torso upright!");
          throttleSpeak("Keep your chest up", 2000);
          return;
        }

        if (isDeep) {
          exerciseState.current = "down";
        } else if (kneeAngle > 155 && exerciseState.current === "down") {
          if (score > 70) {
            handleRep(`Good Lunge! (${score}%)`, score);
          } else {
            setFeedback(`Fix posture (${score}%)`);
          }

          exerciseState.current = "up";
        }
      }
    } else if (exerciseId === "a_pl") {
      // Plank (Hold detection)
      if (
        isStable(lShoulder, lHip, lAnkle) ||
        isStable(rShoulder, rHip, rAnkle)
      ) {
        const leftVisible = isStable(lShoulder, lHip, lAnkle);
        const rightVisible = isStable(rShoulder, rHip, rAnkle);

        const lAngle = leftVisible
          ? calculateAngle(lShoulder, lHip, lAnkle)
          : 0;
        const rAngle = rightVisible
          ? calculateAngle(rShoulder, rHip, rAnkle)
          : 0;

        const avgAngle =
          leftVisible && rightVisible
            ? (lAngle + rAngle) / 2
            : leftVisible
              ? lAngle
              : rAngle;

        let plankColor = "rgba(59, 130, 246, 0.4)";
        if (avgAngle > 165) plankColor = "rgba(16, 185, 129, 0.6)";
        else if (avgAngle < 155 || avgAngle > 190)
          plankColor = "rgba(239, 68, 68, 0.6)"; // Red for bad form

        if (leftVisible) drawGlow(lHip, plankColor);
        if (rightVisible) drawGlow(rHip, plankColor);

        if (avgAngle > 165) {
          // Straight line
          if (!holdStartTime.current) holdStartTime.current = Date.now();
          const holdTime = Math.floor(
            (Date.now() - holdStartTime.current) / 1000,
          );
          if (holdTime > repCount) {
            setRepCount(holdTime);
            setFeedback(`Holding... ${holdTime}s`);
          }
        } else {
          holdStartTime.current = null;
          if (avgAngle < 155) {
            setFeedback("Hips too high!");
            throttleSpeak("Lower your hips", 2000);
          } else if (avgAngle > 190) {
            setFeedback("Hips too low!");
            throttleSpeak("Raise your hips", 2000);
          } else setFeedback("Straighten back!");
        }
      }
    } else if (exerciseId === "a_gb") {
      if (isStable(lShoulder, lHip, lKnee)) {
        const hipAngle = calculateAngle(lShoulder, lHip, lKnee);

        const isUp = hipAngle > 165;

        if (isUp) {
          if (!holdStartTime.current) holdStartTime.current = Date.now();

          const holdTime = (Date.now() - holdStartTime.current) / 1000;

          setFeedback(`Hold... ${holdTime.toFixed(1)}s`);

          if (holdTime > 1.5 && exerciseState.current !== "up") {
            handleRep("Perfect Bridge!");
            exerciseState.current = "up";
          }
        } else {
          holdStartTime.current = null;
          exerciseState.current = "down";
        }
      }
    } else if (exerciseId === "a_bd") {
      if (isStable(lShoulder, rHip, rAnkle, lWrist)) {
        const bodyAngle = calculateAngle(lShoulder, rHip, rAnkle);

        const isExtended =
          lWrist.y < lShoulder.y && rAnkle.y < rHip.y && bodyAngle > 165;

        const score = calculateFormScore([isExtended, bodyAngle > 170]);
        setFormScore(score);

        if (isExtended && exerciseState.current !== "out") {
          handleRep(`Great Extension! (${score}%)`, score);
          exerciseState.current = "out";
        } else if (!isExtended) {
          exerciseState.current = "in";
        }
      }
    } else if (exerciseId === "s_sl") {
      if (isStable(lHip, lKnee, lAnkle, lShoulder)) {
        const legAngle = calculateAngle(lHip, lKnee, lAnkle);
        const backAngle = calculateAngle(lShoulder, lHip, lKnee);

        const isRaised = legAngle > 160;
        const isStraightBack = backAngle > 150;

        const score = calculateFormScore([isRaised, isStraightBack]);
        setFormScore(score);

        if (!isStraightBack) {
          setFeedback("Sit straight!");
          return;
        }

        if (isRaised) {
          exerciseState.current = "up";
        } else if (legAngle < 130 && exerciseState.current === "up") {
          handleRep(`Leg Raise (${score}%)`, score);
          exerciseState.current = "down";
        }
      }
    } else if (exerciseId === "s_hr") {
      if (isStable(lAnkle, lKnee, rAnkle, rKnee)) {
        const diffL = lKnee.y - lAnkle.y;
        const diffR = rKnee.y - rAnkle.y;

        const isRaised = diffL > 0.12 || diffR > 0.12;

        const score = calculateFormScore([isRaised]);
        setFormScore(score);

        if (isRaised && exerciseState.current !== "up") {
          handleRep(`Heels Up! (${score}%)`, score);
          exerciseState.current = "up";
        } else if (!isRaised) {
          exerciseState.current = "down";
        }
      }
    } else if (exerciseId === "s_ar") {
      if (isStable(lShoulder, lElbow, lWrist)) {
        const armAngle = calculateAngle(lShoulder, lElbow, lWrist);

        const isRaised = armAngle > 150;

        const score = calculateFormScore([isRaised]);
        setFormScore(score);

        if (isRaised && exerciseState.current !== "up") {
          handleRep(`Arms Up! (${score}%)`, score);
          exerciseState.current = "up";
        } else if (!isRaised) {
          exerciseState.current = "down";
        }
      }
    } else {
      // Generic Fallback (Squat-like)
      if (isStable(lHip, lKnee, lAnkle) || isStable(rHip, rKnee, rAnkle)) {
        const lAngle = isStable(lHip, lKnee, lAnkle)
          ? calculateAngle(lHip, lKnee, lAnkle)
          : 180;
        const rAngle = isStable(rHip, rKnee, rAnkle)
          ? calculateAngle(rHip, rKnee, rAnkle)
          : 180;
        const avgAngle = (lAngle + rAngle) / 2;

        if (avgAngle < 120) {
          if (exerciseState.current !== "down") {
            exerciseState.current = "down";
          }
        } else if (avgAngle > 165) {
          if (exerciseState.current === "down") {
            handleRep("Good Rep!");
            exerciseState.current = "up";
          }
        }
      }
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    if (!selectedAgeGroup || workoutSequence.length === 0) {
      navigate("/recommendations");
      return;
    }

    // Prevent double initialization
    if (isInit.current) return;
    isInit.current = true;

    const win = window as any;

    // Safety check for MediaPipe globals
    if (!win.Pose || !win.Camera) {
      const t = setTimeout(() => {
        if (isMounted.current && !win.Pose) {
          setError(
            "Failed to load AI models. Please check your internet connection.",
          );
          hasErrorRef.current = true;
        }
      }, 5000);
      return () => clearTimeout(t);
    }

    // Initialize Pose
    try {
      const poseInstance = new win.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseInstance.onResults(onResults);
      poseRef.current = poseInstance;

      // Initialize Camera
      if (videoRef.current) {
        const camera = new win.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && poseRef.current && isMounted.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        if (!cameraRef.current && isMounted.current) {
          cameraRef.current = camera;

          camera
            .start()
            .then(() => {
              if (isMounted.current) {
                setIsModelLoaded(true);
                isModelLoadedRef.current = true;
              }
            })
            .catch((err: any) => {
              console.error("Camera error:", err);
              if (isMounted.current) {
                setError(
                  "Camera access denied or failed. Please check permissions.",
                );
                hasErrorRef.current = true;
              }
            });
        }
      }
    } catch (e: any) {
      console.error("Setup error:", e);
      setError(`Initialization error: ${e.message}`);
      hasErrorRef.current = true;
    }

    // Timeout fallback if it hangs on "Initializing..."
    const loadTimeout = setTimeout(() => {
      // Check refs to avoid stale closures
      if (
        isMounted.current &&
        !isModelLoadedRef.current &&
        !hasErrorRef.current
      ) {
        setError(
          "Taking too long. Please refresh or check camera permissions.",
        );
      }
    }, 20000);

    return () => {
      isMounted.current = false;
      isInit.current = false;
      clearTimeout(loadTimeout);

      if (cameraRef.current) {
        // Camera utils stop() is usually synchronous but toggles a flag
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.warn("Camera cleanup", e);
        }
        cameraRef.current = null;
      }

      if (poseRef.current) {
        // pose.close() returns a promise. We can't await in cleanup easily, but we can trigger it.
        const pose = poseRef.current;
        poseRef.current = null; // Detach ref immediately
        pose.close().catch((e: any) => console.warn("Pose cleanup", e));
      }
    };
  }, []); // Empty dependency array ensures run once on mount

  const startPhase = () => {
    speak("Three. Two. One. Go!");
    setShowPhaseTransition(false);
  };

  const nextPhase = () => {
    if (currentIdx < workoutSequence.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowPhaseTransition(true);
    } else {
      handleEndWorkout();
    }
  };

  const handleEndWorkout = () => {
    const record = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      durationMinutes: Math.ceil(elapsedSeconds / 60),
      exercises: workoutSequence.map((ex) => ex.name),
      totalReps: repCount,
      ageGroup: selectedAgeGroup || AgeGroup.ADULTS,
    };

    speak("Workout complete.");

    if (onWorkoutComplete && selectedAgeGroup) {
      onWorkoutComplete(record);
    }

    navigate("/progress");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const reloadPage = () => {
    window.location.reload();
  };

  if (!activeExercise) return null;

  const progressPercent = (currentIdx / workoutSequence.length) * 100;

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col overflow-hidden text-white font-sans">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover mirror-mode opacity-60"
          playsInline
          muted
          autoPlay
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none mirror-mode z-10"
          width={1280}
          height={720}
        />
        {/* Removed Gradient Overlay for Readability per user request */}
      </div>

      {/* TOP HUD */}
      {/* CAMERA GUIDANCE */}
      {cameraHint && !showPhaseTransition && isModelLoaded && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-5 duration-500">
          <div className="px-6 py-3 rounded-2xl bg-yellow-500/90 backdrop-blur-xl border border-white/10 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black flex items-center gap-2">
              ⚠ {cameraHint}
            </p>
          </div>
        </div>
      )}
      <div className="relative z-20 p-8 pt-8">
        <div className="flex justify-between items-start max-w-7xl mx-auto w-full">
          {/* Progress Bar & Quit - Left Side */}
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex items-center gap-4">
              {/* Progress Bar Only */}
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-blue-500 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {Math.round(progressPercent)}%
              </span>
            </div>

            {/* Live Stats Pill */}
            <div className="flex items-center gap-8 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/5 self-start">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    Time
                  </p>
                  <p className="text-xl font-black leading-none font-mono mt-0.5">
                    {formatTime(elapsedSeconds)}
                  </p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-green-500/20 text-green-400 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    Stage
                  </p>
                  <p className="text-xl font-black leading-none mt-0.5">
                    {currentIdx + 1}
                    <span className="text-sm text-gray-500">
                      /{workoutSequence.length}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Rep Counter AND Feedback */}
          <div className="flex flex-col items-end gap-4">
            {/* Rep Counter */}
            {!showPhaseTransition && isModelLoaded && (
              <div className="flex flex-col items-center animate-in slide-in-from-top-10 duration-700">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">
                  Total Reps
                </span>

                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] min-w-[140px] text-center shadow-2xl">
                  <span className="text-7xl font-black leading-none tracking-tighter text-white">
                    {repCount}
                  </span>
                </div>

                {/* 🔥 FORM SCORE BELOW REPS */}
                <div className="w-24 h-2 bg-white/10 rounded-full mt-2">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{ width: `${formScore}%` }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    Form Score
                  </span>

                  <div
                    className={`text-2xl font-black mt-1 ${
                      formScore > 80
                        ? "text-green-400"
                        : formScore > 60
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {formScore}%
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            {!showPhaseTransition &&
              isModelLoaded &&
              feedback !== "Position yourself..." && (
                <div className="px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-xl bg-black/60">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    {feedback}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Spacer to push bottom bar down */}
      <div className="flex-1"></div>

      {/* BOTTOM CONTROL BAR */}
      <div className="relative z-20 p-8 pb-10">
        <div className="flex items-end justify-between max-w-7xl mx-auto w-full">
          {/* Current Exercise Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                Live Session
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {activeExercise.name}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/5 text-[11px] font-bold uppercase tracking-widest text-blue-300">
                {activeExercise.muscleGroup}
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/5 text-[11px] font-bold uppercase tracking-widest text-orange-300 flex items-center gap-1.5">
                <Flame className="w-3 h-3" /> {activeExercise.calories} Kcal
              </span>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex flex-col items-end gap-3">
            {currentIdx < workoutSequence.length - 1 && (
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Next:{" "}
                <span className="text-white">
                  {workoutSequence[currentIdx + 1].name}
                </span>
              </p>
            )}
            <button
              onClick={nextPhase}
              disabled={showPhaseTransition}
              className="group bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] active:scale-95 border border-white/10"
            >
              {currentIdx < workoutSequence.length - 1
                ? "Next Exercise"
                : "Finish Workout"}
              <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* PHASE TRANSITION OVERLAY */}
      {showPhaseTransition && isModelLoaded && !error && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#020617] p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl max-w-xl w-full relative overflow-hidden group transform hover:scale-[1.01] transition-all duration-500">
            {/* Card Internal Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-blue-200 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>{" "}
                Up Next
              </span>

              <h3 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter uppercase leading-[0.9] text-white drop-shadow-lg">
                {activeExercise.name}
              </h3>

              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

              <p className="text-base md:text-lg text-slate-300 font-medium max-w-md mx-auto mb-6 leading-relaxed tracking-tight">
                "{activeExercise.description}"
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
                    Duration
                  </p>
                  <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
                    <Timer className="w-3.5 h-3.5 text-blue-400" />
                    {activeExercise.duration}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">
                    Difficulty
                  </p>
                  <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    {activeExercise.difficulty}
                  </p>
                </div>
              </div>

              <button
                onClick={startPhase}
                className="w-auto min-w-[240px] mx-auto bg-white hover:bg-blue-50 text-slate-900 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-4 h-4 fill-current" /> Start Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR OVERLAY */}
      {error && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-xl font-bold text-white mb-2 text-center">
            {error}
          </p>
          <p className="text-gray-400 text-sm mb-8 text-center max-w-md">
            We couldn't start the AI vision engine. Please check your camera
            permissions or internet connection.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/recommendations")}
              className="px-6 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700"
            >
              Go Back
            </button>
            <button
              onClick={reloadPage}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* INITIAL LOADING */}
      {!isModelLoaded && !error && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-[6px] border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.5em] text-white/50 animate-pulse">
            Initializing AI Vision...
          </p>
        </div>
      )}

      <style>{`
        .mirror-mode { transform: scaleX(-1); }
      `}</style>
    </div>
  );
};

export default WorkoutPage;

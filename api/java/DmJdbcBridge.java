import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class DmJdbcBridge {
  public static void main(String[] args) {
    String action = args.length > 0 ? args[0] : "";
    try {
      BufferedReader br = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
      String jdbcUrl = readLineSafe(br);
      String user = readLineSafe(br);
      String password = readLineSafe(br);
      String schema = readLineSafe(br);
      String tableName = readLineSafe(br);
      String payloadB64 = readLineSafe(br);

      String payload = "";
      if (payloadB64 != null && !payloadB64.isEmpty()) {
        payload = new String(Base64.getDecoder().decode(payloadB64), StandardCharsets.UTF_8);
      }

      if (jdbcUrl == null || jdbcUrl.isEmpty()) {
        writeError("Missing jdbcUrl");
        return;
      }

      try (Connection conn = DriverManager.getConnection(jdbcUrl, user, password)) {
        if ("TEST".equalsIgnoreCase(action)) {
          test(conn);
          writeOk("");
          return;
        }

        if ("TABLES".equalsIgnoreCase(action)) {
          List<String> tables = getTables(conn, schema);
          writeOk(",\"tables\":" + toJsonStringArray(tables));
          return;
        }

        if ("COLUMNS".equalsIgnoreCase(action)) {
          String t = tableName == null ? "" : tableName;
          if (t.isEmpty()) {
            writeError("Missing tableName");
            return;
          }
          String colsJson = getColumnsJson(conn, t, schema);
          writeOk(",\"columns\":" + colsJson);
          return;
        }

        if ("EXECUTE".equalsIgnoreCase(action)) {
          String sql = payload == null ? "" : payload.trim();
          if (sql.isEmpty()) {
            writeError("Missing sql");
            return;
          }
          String resultJson = executeSqlJson(conn, sql);
          writeOk(resultJson);
          return;
        }

        if ("VALIDATE".equalsIgnoreCase(action)) {
          String sql = payload == null ? "" : payload.trim();
          if (sql.isEmpty()) {
            writeError("Missing sql");
            return;
          }
          validateSql(conn, sql);
          writeOk("");
          return;
        }

        writeError("Unknown action");
      }
    } catch (Exception e) {
      writeError(e.getMessage() == null ? e.toString() : e.getMessage());
    }
  }

  private static String readLineSafe(BufferedReader br) throws Exception {
    String s = br.readLine();
    return s == null ? "" : s;
  }

  private static void test(Connection conn) throws Exception {
    try (Statement stmt = conn.createStatement()) {
      try (ResultSet rs = stmt.executeQuery("SELECT 1")) {
        rs.next();
      }
    }
  }

  private static List<String> getTables(Connection conn, String schema) throws Exception {
    List<String> tables = new ArrayList<>();
    if (schema != null && !schema.trim().isEmpty()) {
      try (PreparedStatement ps = conn.prepareStatement("SELECT table_name FROM all_tables WHERE owner = ? ORDER BY table_name")) {
        ps.setString(1, schema.trim().toUpperCase());
        try (ResultSet rs = ps.executeQuery()) {
          while (rs.next()) {
            tables.add(rs.getString(1));
          }
        }
      }
      return tables;
    }

    try (Statement stmt = conn.createStatement()) {
      try (ResultSet rs = stmt.executeQuery("SELECT table_name FROM user_tables ORDER BY table_name")) {
        while (rs.next()) {
          tables.add(rs.getString(1));
        }
      }
    }

    return tables;
  }

  private static String getColumnsJson(Connection conn, String tableName, String schema) throws Exception {
    String table = tableName.trim().toUpperCase();
    String owner = schema == null ? "" : schema.trim().toUpperCase();

    String sqlWithOwner =
      "SELECT " +
      "  c.column_name, " +
      "  c.data_type, " +
      "  c.nullable, " +
      "  cc.comments, " +
      "  CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_primary_key " +
      "FROM all_tab_columns c " +
      "LEFT JOIN all_col_comments cc ON c.owner = cc.owner AND c.table_name = cc.table_name AND c.column_name = cc.column_name " +
      "LEFT JOIN ( " +
      "  SELECT cols.owner, cols.table_name, cols.column_name " +
      "  FROM all_constraints cons " +
      "  JOIN all_cons_columns cols ON cons.owner = cols.owner AND cons.constraint_name = cols.constraint_name " +
      "  WHERE cons.constraint_type = 'P' " +
      ") pk ON c.owner = pk.owner AND c.table_name = pk.table_name AND c.column_name = pk.column_name " +
      "WHERE c.table_name = ? AND c.owner = ? " +
      "ORDER BY c.column_id";

    String sqlNoOwner =
      "SELECT " +
      "  c.column_name, " +
      "  c.data_type, " +
      "  c.nullable, " +
      "  cc.comments, " +
      "  CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END AS is_primary_key " +
      "FROM user_tab_columns c " +
      "LEFT JOIN user_col_comments cc ON c.table_name = cc.table_name AND c.column_name = cc.column_name " +
      "LEFT JOIN ( " +
      "  SELECT cols.table_name, cols.column_name " +
      "  FROM user_constraints cons " +
      "  JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name " +
      "  WHERE cons.constraint_type = 'P' " +
      ") pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name " +
      "WHERE c.table_name = ? " +
      "ORDER BY c.column_id";

    List<String> items = new ArrayList<>();
    if (!owner.isEmpty()) {
      try (PreparedStatement ps = conn.prepareStatement(sqlWithOwner)) {
        ps.setString(1, table);
        ps.setString(2, owner);
        try (ResultSet rs = ps.executeQuery()) {
          while (rs.next()) {
            String col = rs.getString(1);
            String dataType = rs.getString(2);
            String nullableFlag = rs.getString(3);
            String comment = rs.getString(4);
            String pk = rs.getString(5);
            boolean nullable = "Y".equalsIgnoreCase(nullableFlag);
            boolean primaryKey = "YES".equalsIgnoreCase(pk);
            String cmt = (comment == null || comment.isEmpty()) ? col : comment;

            items.add("{\"columnName\":\"" + esc(col) + "\"," +
              "\"dataType\":\"" + esc(dataType) + "\"," +
              "\"nullable\":" + (nullable ? "true" : "false") + "," +
              "\"primaryKey\":" + (primaryKey ? "true" : "false") + "," +
              "\"comment\":\"" + esc(cmt) + "\"," +
              "\"displayName\":\"" + esc(col) + "\"}");
          }
        }
      }
    } else {
      try (PreparedStatement ps = conn.prepareStatement(sqlNoOwner)) {
        ps.setString(1, table);
        try (ResultSet rs = ps.executeQuery()) {
          while (rs.next()) {
            String col = rs.getString(1);
            String dataType = rs.getString(2);
            String nullableFlag = rs.getString(3);
            String comment = rs.getString(4);
            String pk = rs.getString(5);
            boolean nullable = "Y".equalsIgnoreCase(nullableFlag);
            boolean primaryKey = "YES".equalsIgnoreCase(pk);
            String cmt = (comment == null || comment.isEmpty()) ? col : comment;

            items.add("{\"columnName\":\"" + esc(col) + "\"," +
              "\"dataType\":\"" + esc(dataType) + "\"," +
              "\"nullable\":" + (nullable ? "true" : "false") + "," +
              "\"primaryKey\":" + (primaryKey ? "true" : "false") + "," +
              "\"comment\":\"" + esc(cmt) + "\"," +
              "\"displayName\":\"" + esc(col) + "\"}");
          }
        }
      }
    }

    return "[" + String.join(",", items) + "]";
  }

  private static String executeSqlJson(Connection conn, String sql) throws Exception {
    try (Statement stmt = conn.createStatement()) {
      try (ResultSet rs = stmt.executeQuery(sql)) {
        ResultSetMetaData md = rs.getMetaData();
        int count = md.getColumnCount();
        List<String> colNames = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
          colNames.add(md.getColumnLabel(i));
        }

        List<String> rowJson = new ArrayList<>();
        int rowCount = 0;
        while (rs.next()) {
          List<String> kvs = new ArrayList<>();
          for (int i = 1; i <= count; i++) {
            String key = colNames.get(i - 1);
            Object val = rs.getObject(i);
            kvs.add("\"" + esc(key) + "\":" + toJsonValue(val));
          }
          rowJson.add("{" + String.join(",", kvs) + "}");
          rowCount++;
          if (rowCount >= 1000) break;
        }

        return ",\"columns\":" + toJsonStringArray(colNames) + ",\"rows\":[" + String.join(",", rowJson) + "]";
      }
    }
  }

  private static void validateSql(Connection conn, String sql) throws Exception {
    try (PreparedStatement ps = conn.prepareStatement(sql)) {
      ps.getMetaData();
    }
  }

  private static String toJsonValue(Object v) {
    if (v == null) return "null";
    if (v instanceof Number) return v.toString();
    if (v instanceof Boolean) return ((Boolean) v) ? "true" : "false";
    String s = v.toString();
    return "\"" + esc(s) + "\"";
  }

  private static String toJsonStringArray(List<String> items) {
    List<String> out = new ArrayList<>();
    for (String s : items) {
      out.add("\"" + esc(s) + "\"");
    }
    return "[" + String.join(",", out) + "]";
  }

  private static void writeOk(String extraFields) {
    System.out.print("{\"success\":true" + extraFields + "}");
  }

  private static void writeError(String msg) {
    System.out.print("{\"success\":false,\"error\":\"" + esc(msg) + "\"}");
  }

  private static String esc(String s) {
    if (s == null) return "";
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < s.length(); i++) {
      char c = s.charAt(i);
      if (c == '\\\\') sb.append("\\\\\\\\");
      else if (c == '\"') sb.append("\\\\\"");
      else if (c == '\\n') sb.append("\\\\n");
      else if (c == '\\r') sb.append("\\\\r");
      else if (c == '\\t') sb.append("\\\\t");
      else sb.append(c);
    }
    return sb.toString();
  }
}

